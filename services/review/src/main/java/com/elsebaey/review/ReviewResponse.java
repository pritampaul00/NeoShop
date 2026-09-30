package com.elsebaey.review;

import java.time.LocalDateTime;

public record ReviewResponse(
        String id,
        Integer productId,
        String customerId,
        String customerName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}