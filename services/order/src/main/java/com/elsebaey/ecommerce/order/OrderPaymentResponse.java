package com.elsebaey.ecommerce.order;

import java.math.BigDecimal;

public record OrderPaymentResponse(
        Integer orderId,
        PaymentMethod paymentMethod,
        String razorpayOrderId,
        String razorpayKeyId,
        BigDecimal amount
) {}