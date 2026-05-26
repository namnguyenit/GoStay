package com.gotravel.PaymentandWallet.repository;

import com.gotravel.PaymentandWallet.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    boolean existsBySepayId(Long sepayId);
}
