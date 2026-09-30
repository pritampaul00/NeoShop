package com.elsebaey.review;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "order-service"
)
public interface OrderLineClient {

    @GetMapping("/api/v1/order-lines/customer/{customerId}/product/{productId}/purchased")
    Boolean hasCustomerPurchasedProduct(
            @PathVariable("customerId") String customerId,
            @PathVariable("productId") Integer productId
    );
}