package com.elsebaey.ecommerce.payment;

import java.math.BigDecimal;

public record CodPaymentRequest(
        BigDecimal amount,
        Integer orderId
) {
}