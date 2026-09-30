// package com.elsebaey.ecommerce.orderline;

// public record OrderLineResponse(
//         Integer id,
//         double quantity
// ) {
// }


package com.elsebaey.ecommerce.orderline;

public record OrderLineResponse(
        Integer id,
        Integer productId,
        double quantity
) {
}