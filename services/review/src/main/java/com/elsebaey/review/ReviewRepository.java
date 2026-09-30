package com.elsebaey.review;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository
        extends MongoRepository<Review, String> {

    boolean existsByProductIdAndCustomerId(
            Integer productId,
            String customerId
    );

    List<Review> findByProductIdOrderByCreatedAtDesc(
            Integer productId
    );
}