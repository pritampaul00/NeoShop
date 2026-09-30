package com.elsebaey.ecommerce.payment;

import com.elsebaey.ecommerce.order.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Integer id,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        Integer orderId,
        PaymentStatus status,
        LocalDateTime createdDate,
        LocalDateTime lastModifiedDate
) {
}