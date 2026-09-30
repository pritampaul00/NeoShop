package com.elsebaey.ecommerce.order;

import java.math.BigDecimal;

import com.elsebaey.ecommerce.payment.PaymentStatus;

import java.time.LocalDateTime;

public record OrderResponse(
        Integer orderId,
        String reference,
        BigDecimal totalAmount,
        PaymentMethod paymentMethod,
        OrderStatus status,
        PaymentStatus paymentStatus,
        String customerId,
        Address shippingAddress,
        LocalDateTime createdDate,
        LocalDateTime shippedDate,
        LocalDateTime outForDeliveryDate,
        LocalDateTime deliveredDate
        
) {}