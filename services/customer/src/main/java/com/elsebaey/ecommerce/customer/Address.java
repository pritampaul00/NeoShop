// package com.elsebaey.ecommerce.customer;

// import lombok.*;
// import org.springframework.validation.annotation.Validated;

// @AllArgsConstructor
// @NoArgsConstructor
// @Builder
// @Getter
// @Setter
// @Validated
// public class Address {

//     private String street;
//     private String houseNumber;
//     private String zipCode;
// }

package com.elsebaey.ecommerce.customer;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Address {

    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
