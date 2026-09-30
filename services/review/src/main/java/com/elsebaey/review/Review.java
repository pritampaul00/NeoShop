package com.elsebaey.review;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private Integer productId;

    private String customerId;

    private String customerName;

    private Integer rating;

    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;
}