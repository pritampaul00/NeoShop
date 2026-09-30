package com.elsebaey.ecommerce.order;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;

@Embeddable
public record Address(
        @NotBlank(message = "street is required")
        String street,

        @NotBlank(message = "city is required")
        String city,

        @NotBlank(message = "state is required")
        String state,

        @NotBlank(message = "postal code is required")
        String postalCode,

        @NotBlank(message = "country is required")
        String country
) {
}