package com.elsebaey.ecommerce.payment;

import com.elsebaey.ecommerce.notification.NotificationProducer;
import com.elsebaey.ecommerce.notification.PaymentNotificationRequest;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayOrderResponse;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayPaymentVerificationRequest;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayService;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

        private final PaymentRepository repository;
        private final PaymentMapper mapper;
        private final NotificationProducer notificationProducer;
        private final RazorpayService razorpayService;

        /*
         * OLD PAYMENT FLOW
         *
         * This will be removed after Order Service
         * is completely migrated to Razorpay + COD.
         */
        public Integer createPayment(PaymentRequest request) {

                var payment = mapper.toPayment(request);

                payment.setStatus(PaymentStatus.COMPLETED);

                payment = repository.save(payment);

                notificationProducer.sendPaymentNotification(
                                new PaymentNotificationRequest(
                                                request.orderReference(),
                                                request.amount(),
                                                request.paymentMethod(),
                                                request.customer().firstName(),
                                                request.customer().lastName(),
                                                request.customer().email()));

                return payment.getId();
        }

        public PaymentResponse findByOrderId(Integer orderId) {

                return repository.findByOrderId(orderId)
                                .map(payment -> new PaymentResponse(
                                                payment.getId(),
                                                payment.getAmount(),
                                                payment.getPaymentMethod(),
                                                payment.getOrderId(),
                                                payment.getStatus(),
                                                payment.getRazorpayOrderId(),
                                                payment.getRazorpayPaymentId(),
                                                payment.getCreatedDate(),
                                                payment.getLastModifiedDate()))
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "No payment found for order " + orderId));
        }

        /*
         * RAZORPAY
         *
         * Creates a Razorpay order and stores a PENDING
         * payment record in NeoShop.
         */
        public RazorpayOrderResponse createRazorpayPayment(
                        BigDecimal amount,
                        Integer orderId) {

                try {

                        RazorpayOrderResponse razorpayOrder = razorpayService.createOrder(
                                        amount,
                                        orderId);

                        Payment payment = Payment.builder()
                                        .amount(amount)
                                        .paymentMethod(PaymentMethod.RAZORPAY)
                                        .status(PaymentStatus.PENDING)
                                        .orderId(orderId)
                                        .razorpayOrderId(
                                                        razorpayOrder.razorpayOrderId())
                                        .build();

                        repository.save(payment);

                        return razorpayOrder;

                } catch (Exception exception) {

                        throw new ResponseStatusException(
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        "Unable to create Razorpay payment.");
                }
        }

        /*
         * Verifies the Razorpay signature and completes
         * the NeoShop payment if verification succeeds.
         */
        public boolean verifyRazorpayPayment(
                        RazorpayPaymentVerificationRequest request) {

                boolean verified = razorpayService.verifyPayment(
                                request.razorpayOrderId(),
                                request.razorpayPaymentId(),
                                request.razorpaySignature());

                if (!verified) {
                        return false;
                }

                completeRazorpayPayment(request);

                return true;
        }

        /*
         * Updates the NeoShop payment after successful
         * Razorpay signature verification.
         */
        public void completeRazorpayPayment(
                        RazorpayPaymentVerificationRequest request) {

                Payment payment = repository
                                .findByOrderId(request.orderId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "No payment found for order "
                                                                + request.orderId()));

                if (!request.razorpayOrderId()
                                .equals(payment.getRazorpayOrderId())) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Razorpay order ID does not match.");
                }

                payment.setRazorpayPaymentId(
                                request.razorpayPaymentId());

                payment.setStatus(PaymentStatus.COMPLETED);

                repository.save(payment);
        }

        public Integer createCodPayment(
                        CodPaymentRequest request) {

                Payment payment = Payment.builder()
                                .amount(request.amount())
                                .paymentMethod(PaymentMethod.COD)
                                .status(PaymentStatus.PENDING)
                                .orderId(request.orderId())
                                .build();

                payment = repository.save(payment);

                return payment.getId();
        }

        public void completeCodPayment(Integer orderId) {

                Payment payment = repository
                                .findByOrderId(orderId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "No payment found for order "
                                                                + orderId));

                if (payment.getPaymentMethod() != PaymentMethod.COD) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Payment is not COD.");
                }

                payment.setStatus(PaymentStatus.COMPLETED);

                repository.save(payment);
        }
}