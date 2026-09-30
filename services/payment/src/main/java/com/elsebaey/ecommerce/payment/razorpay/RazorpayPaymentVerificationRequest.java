package com.elsebaey.ecommerce.payment.razorpay;

public record RazorpayPaymentVerificationRequest(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature,
        Integer orderId
) {
}