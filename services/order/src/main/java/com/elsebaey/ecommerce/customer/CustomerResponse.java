// package com.elsebaey.ecommerce.customer;

// public record CustomerResponse(
//         String id,
//         String firstName,
//         String lastName,
//         String email
// ) {
// }

package com.elsebaey.ecommerce.customer;

import com.elsebaey.ecommerce.order.Address;

public record CustomerResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        Address address
) {
}