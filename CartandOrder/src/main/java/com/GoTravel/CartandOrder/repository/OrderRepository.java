package com.GoTravel.CartandOrder.repository;

import com.GoTravel.CartandOrder.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Order> findByHostIdOrderByCreatedAtDesc(UUID hostId, Pageable pageable);
}
