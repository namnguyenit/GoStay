package com.gotravel.PaymentandWallet.repository;

import com.gotravel.PaymentandWallet.entity.PaymentRequest;
import com.gotravel.PaymentandWallet.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {
    Optional<PaymentRequest> findByOrderId(UUID orderId);
    Optional<PaymentRequest> findByPaymentCode(String paymentCode);
    Page<PaymentRequest> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    List<PaymentRequest> findByStatusAndExpiresAtBefore(PaymentStatus status, LocalDateTime dateTime);
}
