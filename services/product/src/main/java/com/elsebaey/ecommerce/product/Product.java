// package com.elsebaey.ecommerce.product;

// import com.elsebaey.ecommerce.category.Category;
// import jakarta.persistence.*;
// import lombok.*;

// import java.math.BigDecimal;

// @AllArgsConstructor
// @NoArgsConstructor
// @Getter
// @Setter
// @Builder
// @Entity
// public class Product {

//     @Id
//     @GeneratedValue
//     private Integer id;
//     private String name;
//     private String description;
//     private double availableQuantity;
//     private BigDecimal price;

//     @ManyToOne
//     @JoinColumn(name = "category_id")
//     private Category category;
// }


package com.elsebaey.ecommerce.product;

import com.elsebaey.ecommerce.category.Category;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
public class Product {

    @Id
    @GeneratedValue
    private Integer id;

    private String name;

    private String description;

    private double availableQuantity;

    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection
    @CollectionTable(
            name = "product_images",
            joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
}