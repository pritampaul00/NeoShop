package com.elsebaey.ecommerce.payment.razorpay;

import java.math.BigDecimal;

public record RazorpayOrderResponse(
        String razorpayOrderId,
        BigDecimal amount,
        String currency,
        String keyId
) {
}