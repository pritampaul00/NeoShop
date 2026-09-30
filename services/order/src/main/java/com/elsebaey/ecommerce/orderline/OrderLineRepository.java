// package com.elsebaey.ecommerce.orderline;

// import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.Arrays;
// import java.util.List;

// public interface OrderLineRepository extends JpaRepository<OrderLine, Integer> {

//     List<OrderLine> findAllByOrderId(Integer orderId);
// }


package com.elsebaey.ecommerce.orderline;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderLineRepository extends JpaRepository<OrderLine, Integer> {

    List<OrderLine> findAllByOrderId(Integer orderId);

    boolean existsByProductIdAndOrder_CustomerId(
            Integer productId,
            String customerId
    );
}