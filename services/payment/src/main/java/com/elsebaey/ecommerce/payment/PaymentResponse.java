package com.elsebaey.ecommerce.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Integer id,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        Integer orderId,
        PaymentStatus status,
        String razorpayOrderId,
        String razorpayPaymentId,
        LocalDateTime createdAt,
        LocalDateTime lastModifiedAt
) {
}