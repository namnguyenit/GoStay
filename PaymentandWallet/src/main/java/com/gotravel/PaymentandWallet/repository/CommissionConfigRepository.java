package com.gotravel.PaymentandWallet.repository;

import com.gotravel.PaymentandWallet.entity.CommissionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommissionConfigRepository extends JpaRepository<CommissionConfig, String> {
}
