package com.elsebaey.ecommerce.payment;

import com.elsebaey.ecommerce.config.FeignConfig;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayOrderRequest;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayOrderResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
// import com.elsebaey.ecommerce.payment.CodPaymentRequest;

@FeignClient(name = "payment-service", configuration = FeignConfig.class)
public interface PaymentClient {

        @PostMapping(value = "/api/v1/payments/razorpay/order", consumes = MediaType.APPLICATION_JSON_VALUE)
        RazorpayOrderResponse createRazorpayOrder(
        @RequestBody RazorpayOrderRequest request);

        @GetMapping("/api/v1/payments/order/{order-id}")
        PaymentResponse findPaymentByOrderId(
        @PathVariable("order-id") Integer orderId);

        @PostMapping(value = "/api/v1/payments/cod", consumes = MediaType.APPLICATION_JSON_VALUE)
        Integer createCodPayment(
        @RequestBody CodPaymentRequest request);

        @PostMapping("/api/v1/payments/cod/{order-id}/complete")
        void completeCodPayment(
        @PathVariable("order-id") Integer orderId);

}