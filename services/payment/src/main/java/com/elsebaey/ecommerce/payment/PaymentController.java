package com.elsebaey.ecommerce.payment;

import com.elsebaey.ecommerce.payment.razorpay.RazorpayOrderRequest;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayOrderResponse;
import com.elsebaey.ecommerce.payment.razorpay.RazorpayPaymentVerificationRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

        private final PaymentService service;

        @PostMapping
        public ResponseEntity<Integer> createPayment(
                        @RequestBody @Valid PaymentRequest request) {

                return ResponseEntity.ok(
                                service.createPayment(request));
        }

        @GetMapping("/order/{order-id}")
        public ResponseEntity<PaymentResponse> findByOrderId(
                        @PathVariable("order-id") Integer orderId) {

                return ResponseEntity.ok(
                                service.findByOrderId(orderId));
        }

        @PostMapping("/razorpay/order")
        public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
                        @RequestBody RazorpayOrderRequest request) {

                return ResponseEntity.ok(
                                service.createRazorpayPayment(
                                                request.amount(),
                                                request.orderId()));
        }

        @PostMapping("/razorpay/verify")
        public ResponseEntity<Void> verifyRazorpayPayment(
                        @RequestBody RazorpayPaymentVerificationRequest request) {

                boolean verified = service.verifyRazorpayPayment(request);

                if (!verified) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Payment verification failed.");
                }

                return ResponseEntity.ok().build();
        }

        @PostMapping("/cod")
        public ResponseEntity<Integer> createCodPayment(
                        @RequestBody CodPaymentRequest request) {

                return ResponseEntity.ok(
                                service.createCodPayment(request));
        }

        @PostMapping("/cod/{order-id}/complete")
        public ResponseEntity<Void> completeCodPayment(
                        @PathVariable("order-id") Integer orderId) {

                service.completeCodPayment(orderId);

                return ResponseEntity.noContent().build();
        }
}