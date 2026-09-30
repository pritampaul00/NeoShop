package com.elsebaey.review;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderLineClient orderLineClient;

    public ReviewService(
            ReviewRepository reviewRepository,
            OrderLineClient orderLineClient
    ) {
        this.reviewRepository = reviewRepository;
        this.orderLineClient = orderLineClient;
    }

    public ReviewResponse createReview(ReviewRequest request) {

        Boolean purchased = orderLineClient.hasCustomerPurchasedProduct(
                request.customerId(),
                request.productId()
        );

        if (!Boolean.TRUE.equals(purchased)) {
            throw new IllegalStateException(
                    "You can only review products you have purchased."
            );
        }

        boolean alreadyReviewed =
                reviewRepository.existsByProductIdAndCustomerId(
                        request.productId(),
                        request.customerId()
                );

        if (alreadyReviewed) {
            throw new IllegalStateException(
                    "You have already reviewed this product."
            );
        }

        Review review = Review.builder()
                .productId(request.productId())
                .customerId(request.customerId())
                .customerName(request.customerName())
                .rating(request.rating())
                .comment(request.comment())
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        return toResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByProduct(Integer productId) {

        return reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewSummary getReviewSummary(Integer productId) {

        List<Review> reviews =
                reviewRepository
                        .findByProductIdOrderByCreatedAtDesc(productId);

        if (reviews.isEmpty()) {
            return new ReviewSummary(0.0, 0);
        }

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        double roundedAverage =
                Math.round(averageRating * 10.0) / 10.0;

        return new ReviewSummary(
                roundedAverage,
                reviews.size()
        );
    }

    public void deleteReview(String reviewId, String customerId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Review not found."
                        )
                );

        if (!review.getCustomerId().equals(customerId)) {
            throw new IllegalStateException(
                    "You can only delete your own review."
            );
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review review) {

        return new ReviewResponse(
                review.getId(),
                review.getProductId(),
                review.getCustomerId(),
                review.getCustomerName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}