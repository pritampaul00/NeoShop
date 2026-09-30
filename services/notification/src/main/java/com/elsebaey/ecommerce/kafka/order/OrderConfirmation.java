package com.elsebaey.ecommerce.kafka.order;

import com.elsebaey.ecommerce.kafka.payment.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;

public record OrderConfirmation(
        String orderReference,
        BigDecimal totalAmount,
        PaymentMethod paymentMethod,
        Customer customer,
        Address shippingAddress,
        List<Product> products
) {
}
