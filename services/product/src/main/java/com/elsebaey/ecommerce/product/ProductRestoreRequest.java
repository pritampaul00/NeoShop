package com.elsebaey.ecommerce.product;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductRestoreRequest(
        @NotNull Integer productId,

        @NotNull
        @Positive
        Integer quantity
) {}