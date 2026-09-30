package com.elsebaey.ecommerce.product;

public record ProductRestoreRequest(
        Integer productId,
        Integer quantity
) {}