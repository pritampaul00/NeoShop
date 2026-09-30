package com.elsebaey.ecommerce.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderStatusProducer {

    private final KafkaTemplate<String, OrderStatusUpdate> kafkaTemplate;

    public void sendOrderStatusUpdate(OrderStatusUpdate orderStatusUpdate) {

        log.info(
                "Sending order status update: {}",
                orderStatusUpdate
        );

        Message<OrderStatusUpdate> message =
                MessageBuilder
                        .withPayload(orderStatusUpdate)
                        .setHeader(
                                KafkaHeaders.TOPIC,
                                "order-status-topic"
                        )
                        .build();

        kafkaTemplate.send(message);
    }
}