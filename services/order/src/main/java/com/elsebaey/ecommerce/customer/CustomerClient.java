package com.elsebaey.ecommerce.customer;

import com.elsebaey.ecommerce.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "customer-service",
        configuration = FeignConfig.class
)
public interface CustomerClient {

    @GetMapping("/api/v1/customers/{customer-id}")
    CustomerResponse findById(
            @PathVariable("customer-id") String customerId
    );
}