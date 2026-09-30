package com.elsebaey.ecommerce.order;

import org.springframework.stereotype.Service;

@Service
public class OrderMapper {
    public Order toOrder(OrderRequest request) {
        return Order.builder()
                .id(request.id())
                .customerId(request.customerId())
                .reference(request.reference())
                .totalAmount(request.amount())
                .paymentMethod(request.paymentMethod())
                // new addition to map the shipping address from OrderRequest to Order
                .shippingAddress(request.shippingAddress())
                .build();

    }

    public OrderResponse toOrderResponse(Order order) {
    return new OrderResponse(
            order.getId(),
            order.getReference(),
            order.getTotalAmount(),
            order.getPaymentMethod(),
            order.getStatus(),
            null,
            order.getCustomerId(),
            order.getShippingAddress(),
            order.getCreatedDate(),
            order.getShippedDate(),
            order.getOutForDeliveryDate(),
            order.getDeliveredDate()
    );
}
}