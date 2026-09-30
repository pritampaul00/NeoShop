package com.elsebaey.ecommerce.payment.razorpay;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RazorpayService {

        @Value("${razorpay.key-id}")
        private String keyId;

        @Value("${razorpay.key-secret}")
        private String keySecret;

        public RazorpayOrderResponse createOrder(
                        BigDecimal amount,
                        Integer neoShopOrderId) throws Exception {

                RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

                JSONObject request = new JSONObject();

                request.put("amount",amount.movePointRight(2).intValueExact());

                request.put("currency", "INR");

                request.put(
                                "receipt",
                                "NEOSHOP-" + neoShopOrderId);

                request.put("payment_capture", 1);

                Order razorpayOrder = razorpayClient.orders.create(request);

                return new RazorpayOrderResponse(
                                razorpayOrder.get("id"),
                                amount,
                                "INR",
                                keyId);
        }

        public boolean verifyPayment(
                        String razorpayOrderId,
                        String razorpayPaymentId,
                        String razorpaySignature) {

                try {

                        String payload = razorpayOrderId + "|" + razorpayPaymentId;

                        return Utils.verifySignature(
                                        payload,
                                        razorpaySignature,
                                        keySecret);

                } catch (Exception exception) {

                        return false;
                }
        }
}