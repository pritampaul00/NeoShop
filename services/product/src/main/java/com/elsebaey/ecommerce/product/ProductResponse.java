// package com.elsebaey.ecommerce.product;

// import java.math.BigDecimal;

// public record ProductResponse(
//     Integer id,
//     String name,
//     String description,
//     double availableQuantity,
//     BigDecimal price,
//     Integer categoryId,
//     String categoryName,
//     String categoryDescription
// ) {
// }


package com.elsebaey.ecommerce.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(

        Integer id,

        String name,

        String description,

        double availableQuantity,

        BigDecimal price,

        Integer categoryId,

        String categoryName,

        String categoryDescription,

        List<String> imageUrls

) {
}