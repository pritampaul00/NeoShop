package com.elsebaey.ecommerce.kafka.order;

public record Address(
        String street,
        String city,
        String state,
        String postalCode,
        String country
) {
}