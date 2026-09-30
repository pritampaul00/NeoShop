package com.elsebaey.ecommerce.email;

import lombok.Getter;

public enum EmailTemplate {

    PAYMENT_CONFIRMATION(
            "payment-confirmation.html",
            "Payment successfully processed"
    ),

    ORDER_CONFIRMATION(
            "order-confirmation.html",
            "Order successfully placed"
    ),

    ORDER_SHIPPED(
            "order-shipped.html",
            "Your NeoShop order has been shipped"
    ),

    OUT_FOR_DELIVERY(
            "out-for-delivery.html",
            "Your NeoShop order is out for delivery"
    ),

    ORDER_DELIVERED(
            "order-delivered.html",
            "Your NeoShop order has been delivered"
    );

    @Getter
    private final String template;

    @Getter
    private final String subject;

    EmailTemplate(
            String template,
            String subject
    ) {
        this.template = template;
        this.subject = subject;
    }
}