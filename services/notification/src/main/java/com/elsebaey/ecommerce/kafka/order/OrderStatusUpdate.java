package com.elsebaey.ecommerce.kafka.order;

import java.time.LocalDateTime;

public record OrderStatusUpdate(
        String orderReference,
        String customerEmail,
        String customerName,
        String status,
        LocalDateTime timestamp
) {
}