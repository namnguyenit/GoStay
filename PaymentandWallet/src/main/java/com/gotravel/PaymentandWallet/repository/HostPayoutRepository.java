package com.gotravel.PaymentandWallet.repository;

import com.gotravel.PaymentandWallet.entity.HostPayout;
import com.gotravel.PaymentandWallet.enums.PayoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HostPayoutRepository extends JpaRepository<HostPayout, UUID> {
    Page<HostPayout> findByHostIdOrderByCreatedAtDesc(UUID hostId, Pageable pageable);
    Page<HostPayout> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<HostPayout> findByStatus(PayoutStatus status);
    Optional<HostPayout> findByOrderId(UUID orderId);
}
