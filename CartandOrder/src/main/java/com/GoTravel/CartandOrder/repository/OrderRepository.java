package com.GoTravel.CartandOrder.repository;

import com.GoTravel.CartandOrder.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.GoTravel.CartandOrder.enums.OrderStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Order> findByHostIdOrderByCreatedAtDesc(UUID hostId, Pageable pageable);
    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(order.totalAmount), 0) from Order order")
    BigDecimal sumTotalAmount();

    @Query("select coalesce(sum(order.totalAmount), 0) from Order order where order.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);

    @Query(value = """
            select cast(created_at as date) as report_date,
                   coalesce(sum(total_amount), 0) as total_amount,
                   count(*) as order_count
            from orders
            where created_at >= :startDate and created_at < :endDate
            group by cast(created_at as date)
            order by report_date
            """, nativeQuery = true)
    List<Object[]> getDailyOrderReport(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o JOIN o.items i WHERE o.userId = :userId AND i.listingId = :listingId AND o.status IN :statuses")
    boolean hasPurchasedListing(@Param("userId") UUID userId, @Param("listingId") UUID listingId, @Param("statuses") List<OrderStatus> statuses);
}
