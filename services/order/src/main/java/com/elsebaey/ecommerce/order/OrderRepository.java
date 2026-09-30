package com.elsebaey.ecommerce.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository
        extends JpaRepository<Order, Integer> {

    long countByStatus(OrderStatus status);
    List<Order> findByStatusIn(List<OrderStatus> statuses);

    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0)
            FROM Order o
            WHERE o.status <> com.elsebaey.ecommerce.order.OrderStatus.CANCELLED
            """)
    BigDecimal calculateTotalRevenue();
}