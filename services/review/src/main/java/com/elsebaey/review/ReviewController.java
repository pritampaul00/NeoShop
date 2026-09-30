package com.elsebaey.review;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.ok(
                reviewService.createReview(request)
        );
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProduct(
            @PathVariable Integer productId
    ) {
        return ResponseEntity.ok(
                reviewService.getReviewsByProduct(productId)
        );
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<ReviewSummary> getReviewSummary(
            @PathVariable Integer productId
    ) {
        return ResponseEntity.ok(
                reviewService.getReviewSummary(productId)
        );
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable String reviewId,
            @RequestParam String customerId
    ) {
        reviewService.deleteReview(reviewId, customerId);

        return ResponseEntity.noContent().build();
    }
}