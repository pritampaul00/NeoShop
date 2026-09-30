package com.elsebaey.ecommerce.order;

import com.elsebaey.ecommerce.customer.CustomerClient;
import com.elsebaey.ecommerce.exception.BusinessException;
import com.elsebaey.ecommerce.kafka.OrderConfirmation;
import com.elsebaey.ecommerce.kafka.OrderProducer;
import com.elsebaey.ecommerce.kafka.OrderStatusProducer;
import com.elsebaey.ecommerce.kafka.OrderStatusUpdate;
import com.elsebaey.ecommerce.orderline.OrderLineRequest;
import com.elsebaey.ecommerce.orderline.OrderLineService;
import com.elsebaey.ecommerce.payment.CodPaymentRequest;
import com.elsebaey.ecommerce.payment.PaymentClient;
import com.elsebaey.ecommerce.payment.PaymentResponse;
import com.elsebaey.ecommerce.payment.PaymentStatus;
import com.elsebaey.ecommerce.product.ProductClient;
import com.elsebaey.ecommerce.product.ProductRestoreRequest;
import com.elsebaey.ecommerce.product.PurchaseRequest;

import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerClient customerClient;
    private final ProductClient productClient;
    private final OrderMapper mapper;
    private final OrderLineService orderLineService;
    private final OrderProducer orderProducer;
    private final OrderStatusProducer orderStatusProducer;
    private final PaymentClient paymentClient;
    private final OrderRepository repository;

    public Integer createOrder(OrderRequest request) {

        var customer = customerClient.findById(
                request.customerId()
        );

        if (customer == null) {
            throw new BusinessException(
                    "Cannot create order:: No customer with id "
                            + request.customerId()
            );
        }

        /*
         * Reserve / purchase products first.
         */
        var purchasedProducts =
                productClient.purchaseProducts(
                        request.products()
                );

        /*
         * Create NeoShop order.
         */
        var order = mapper.toOrder(request);

        order.setStatus(OrderStatus.PENDING);

        order = repository.save(order);

        /*
         * Create order lines.
         */
        for (PurchaseRequest purchaseRequest :
                request.products()) {

            orderLineService.saveOrderLine(
                    new OrderLineRequest(
                            null,
                            order.getId(),
                            purchaseRequest.productId(),
                            purchaseRequest.quantity()
                    )
            );
        }

        /*
         * COD payment is created immediately.
         *
         * Razorpay payment is created separately by the
         * frontend after receiving the NeoShop order ID.
         */
        if (request.paymentMethod() == PaymentMethod.COD) {

            paymentClient.createCodPayment(
                    new CodPaymentRequest(
                            request.amount(),
                            order.getId()
                    )
            );
        }

        /*
         * Send order confirmation notification.
         */
        orderProducer.sendOrderConfirmation(
                new OrderConfirmation(
                        order.getReference(),
                        order.getTotalAmount(),
                        order.getPaymentMethod(),
                        customer,
                        order.getShippingAddress(),
                        purchasedProducts
                )
        );

        return order.getId();
    }

    public List<OrderResponse> findAll() {

        return repository.findAll()
                .stream()
                .map(this::toOrderResponseWithPaymentStatus)
                .toList();
    }

    public OrderResponse findById(Integer orderId) {

        return repository.findById(orderId)
                .map(this::toOrderResponseWithPaymentStatus)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "No order with id " + orderId
                        )
                );
    }

    /*
     * ============================================================
     * ORDER STATUS SCHEDULER
     * ============================================================
     *
     * TESTING:
     * Runs every 10 seconds.
     *
     * ORDER FLOW:
     *
     * PENDING
     *    ↓
     * CONFIRMED
     *    ↓ 30 seconds
     * SHIPPED
     *    ↓ 30 seconds
     * OUT_FOR_DELIVERY
     *    ↓ 30 seconds
     * DELIVERED
     *
     * PRODUCTION:
     * Change to:
     *
     * @Scheduled(fixedDelay = 60 * 60 * 1000)
     */
    @Scheduled(fixedDelay = 10 * 1000)
    // @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void updateOrderStatuses() {

        LocalDateTime now = LocalDateTime.now();

        var orders = repository.findByStatusIn(
                List.of(
                        OrderStatus.PENDING,
                        OrderStatus.CONFIRMED,
                        OrderStatus.SHIPPED,
                        OrderStatus.OUT_FOR_DELIVERY
                )
        );

        for (Order order : orders) {

            if (order.getCreatedDate() == null) {
                continue;
            }

            /*
             * ====================================================
             * PENDING -> CONFIRMED
             * ====================================================
             *
             * Razorpay:
             * Wait until payment is COMPLETED.
             *
             * COD:
             * Can be confirmed immediately.
             */
            if (order.getStatus() == OrderStatus.PENDING) {

                /*
                 * Razorpay orders must be successfully paid
                 * before the order can proceed.
                 */
                if (order.getPaymentMethod() == PaymentMethod.RAZORPAY) {

                    PaymentResponse payment;

                    try {

                        payment =
                                paymentClient.findPaymentByOrderId(
                                        order.getId()
                                );

                    } catch (FeignException.NotFound exception) {

                        /*
                         * Payment has not been created yet.
                         */
                        continue;
                    }

                    if (payment == null ||
                            payment.status() != PaymentStatus.COMPLETED) {

                        /*
                         * Payment is still pending.
                         */
                        continue;
                    }
                }

                /*
                 * Payment is valid / COD order.
                 *
                 * Move:
                 *
                 * PENDING -> CONFIRMED
                 */
                order.setStatus(OrderStatus.CONFIRMED);

                /*
                 * Don't immediately move to SHIPPED.
                 * The next scheduler run will handle it.
                 */
                continue;
            }

            /*
             * ====================================================
             * CONFIRMED -> SHIPPED
             * ====================================================
             *
             * Wait 30 seconds after order creation.
             */
            if (order.getStatus() == OrderStatus.CONFIRMED) {

                if (!now.isBefore(
                        order.getCreatedDate().plusSeconds(30))) {

                    order.setStatus(OrderStatus.SHIPPED);

                    order.setShippedDate(now);

                    /*
                     * Send Kafka status event.
                     *
                     * Notification service will send:
                     *
                     * "Your order has been shipped"
                     */
                    sendStatusUpdate(order);
                }

                continue;
            }

            /*
             * ====================================================
             * SHIPPED -> OUT_FOR_DELIVERY
             * ====================================================
             *
             * Wait 30 seconds after shipping.
             */
            if (order.getStatus() == OrderStatus.SHIPPED) {

                if (order.getShippedDate() != null &&
                        !now.isBefore(
                                order.getShippedDate().plusSeconds(30))) {

                    order.setStatus(
                            OrderStatus.OUT_FOR_DELIVERY
                    );

                    order.setOutForDeliveryDate(now);

                    /*
                     * Send Kafka status event.
                     *
                     * Notification service will send:
                     *
                     * "Your order is out for delivery"
                     */
                    sendStatusUpdate(order);
                }

                continue;
            }

            /*
             * ====================================================
             * OUT_FOR_DELIVERY -> DELIVERED
             * ====================================================
             *
             * Wait 30 seconds after going out for delivery.
             */
            if (order.getStatus() ==
                    OrderStatus.OUT_FOR_DELIVERY) {

                if (order.getOutForDeliveryDate() != null &&
                        !now.isBefore(
                                order.getOutForDeliveryDate()
                                        .plusSeconds(30))) {

                    order.setStatus(
                            OrderStatus.DELIVERED
                    );

                    order.setDeliveredDate(now);

                    /*
                     * Send Kafka status event.
                     *
                     * Notification service will send:
                     *
                     * "Your order has been delivered"
                     */
                    sendStatusUpdate(order);

                    /*
                     * Complete COD payment after delivery.
                     */
                    if (order.getPaymentMethod() ==
                            PaymentMethod.COD) {

                        try {

                            paymentClient.completeCodPayment(
                                    order.getId()
                            );

                        } catch (FeignException.NotFound exception) {

                            /*
                             * Payment record does not exist.
                             */
                        }
                    }
                }
            }
        }

        repository.saveAll(orders);
    }

    /*
     * ============================================================
     * SEND ORDER STATUS UPDATE
     * ============================================================
     *
     * Gets the customer details and publishes the status event
     * to Kafka.
     */
    private void sendStatusUpdate(Order order) {

        var customer = customerClient.findById(
                order.getCustomerId()
        );

        if (customer == null) {
            return;
        }

        orderStatusProducer.sendOrderStatusUpdate(
                new OrderStatusUpdate(
                        order.getReference(),
                        customer.email(),
                        customer.firstName()
                                + " "
                                + customer.lastName(),
                        order.getStatus().name(),
                        LocalDateTime.now()
                )
        );
    }

    /*
     * ============================================================
     * ORDER RESPONSE
     * ============================================================
     */
    private OrderResponse toOrderResponseWithPaymentStatus(
            Order order) {

        PaymentResponse payment = null;

        try {

            payment =
                    paymentClient.findPaymentByOrderId(
                            order.getId()
                    );

        } catch (FeignException.NotFound exception) {

            /*
             * Order exists but payment does not exist yet.
             */
            payment = null;
        }

        return new OrderResponse(
                order.getId(),
                order.getReference(),
                order.getTotalAmount(),
                order.getPaymentMethod(),
                order.getStatus(),
                payment != null
                        ? payment.status()
                        : null,
                order.getCustomerId(),
                order.getShippingAddress(),
                order.getCreatedDate(),
                order.getShippedDate(),
                order.getOutForDeliveryDate(),
                order.getDeliveredDate()
        );
    }

    /*
     * ============================================================
     * CANCEL ORDER
     * ============================================================
     */
    public void cancelOrder(
            Integer orderId,
            String customerId) {

        var order = repository.findById(orderId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "No order with id " + orderId
                        )
                );

        if (!order.getCustomerId().equals(customerId)) {

            throw new BusinessException(
                    "You can only cancel your own orders."
            );
        }

        if (order.getStatus() ==
                OrderStatus.CANCELLED) {

            throw new BusinessException(
                    "Order is already cancelled."
            );
        }

        /*
         * Orders can no longer be cancelled once they
         * have been shipped or are out for delivery.
         */
        if (order.getStatus() ==
                        OrderStatus.SHIPPED ||
                order.getStatus() ==
                        OrderStatus.OUT_FOR_DELIVERY ||
                order.getStatus() ==
                        OrderStatus.DELIVERED) {

            throw new BusinessException(
                    "This order can no longer be cancelled."
            );
        }

        /*
         * Restore purchased products.
         */
        var orderLines =
                orderLineService.findAllByOrderId(
                        orderId
                );

        var productsToRestore =
                orderLines.stream()
                        .map(orderLine ->
                                new ProductRestoreRequest(
                                        orderLine.productId(),
                                        (int) orderLine.quantity()
                                )
                        )
                        .toList();

        productClient.restoreProducts(
                productsToRestore
        );

        /*
         * Cancel order.
         */
        order.setStatus(
                OrderStatus.CANCELLED
        );

        repository.save(order);
    }
}