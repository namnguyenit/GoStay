package com.gotravel.PaymentandWallet.repository;

import com.gotravel.PaymentandWallet.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    boolean existsBySepayId(Long sepayId);

    @Query("select coalesce(sum(transaction.amount), 0) from PaymentTransaction transaction")
    BigDecimal sumAmount();
}
