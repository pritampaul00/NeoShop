package com.elsebaey.ecommerce.payment.razorpay;

import java.math.BigDecimal;

public record RazorpayOrderRequest(
        BigDecimal amount,
        Integer orderId
) {
}