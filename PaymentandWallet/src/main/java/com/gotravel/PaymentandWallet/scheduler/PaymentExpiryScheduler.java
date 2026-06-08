package com.gotravel.PaymentandWallet.scheduler;

import com.gotravel.PaymentandWallet.client.OrderClient;
import com.gotravel.PaymentandWallet.entity.PaymentRequest;
import com.gotravel.PaymentandWallet.enums.PaymentStatus;
import com.gotravel.PaymentandWallet.repository.PaymentRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cron Job chạy mỗi 1 phút.
 * Quét các PaymentRequest quá hạn (PENDING + expires_at < now).
 * Cập nhật thành EXPIRED và báo CartandOrder hủy đơn + nhả phòng.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentExpiryScheduler {

    private final PaymentRequestRepository paymentRequestRepository;
    private final OrderClient orderClient;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireOverduePayments() {
        List<PaymentRequest> expiredPayments = paymentRequestRepository
                .findByStatusAndExpiresAtBefore(PaymentStatus.PENDING, LocalDateTime.now());

        for (PaymentRequest payment : expiredPayments) {
            payment.setStatus(PaymentStatus.EXPIRED);
            paymentRequestRepository.save(payment);

            log.info("Payment {} expired for order {}", payment.getPaymentCode(), payment.getOrderId());

            try {
                orderClient.notifyPaymentFailed(payment.getOrderId());
            } catch (Exception e) {
                log.error("Failed to notify CartOrder about expired payment for order {}", payment.getOrderId(), e);
            }
        }
    }
}
