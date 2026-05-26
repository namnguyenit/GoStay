package com.gotravel.PaymentandWallet.service;

import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.entity.HostPayout;
import com.gotravel.PaymentandWallet.enums.PayoutStatus;
import com.gotravel.PaymentandWallet.exeption.AppException;
import com.gotravel.PaymentandWallet.exeption.PaymentErrorCode;
import com.gotravel.PaymentandWallet.mapper.PaymentMapper;
import com.gotravel.PaymentandWallet.repository.HostPayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service quản lý việc chi trả cho Host (chủ dịch vụ).
 * Sau khi khách thanh toán, GoStay giữ 5% hoa hồng và ghi nhận 95% cần trả cho Host.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HostPayoutService {

    private final HostPayoutRepository hostPayoutRepository;
    private final PaymentMapper paymentMapper;

    /**
     * Host xem danh sách các khoản tiền sẽ nhận (phân trang).
     */
    @Transactional(readOnly = true)
    public Page<HostPayoutResponse> getPayoutsByHost(UUID hostId, Pageable pageable) {
        return hostPayoutRepository.findByHostIdOrderByCreatedAtDesc(hostId, pageable)
                .map(paymentMapper::toHostPayoutResponse);
    }

    /**
     * Admin đánh dấu đã chuyển tiền cho Host.
     */
    @Transactional
    public void markAsPaid(UUID payoutId) {
        HostPayout payout = hostPayoutRepository.findById(payoutId)
                .orElseThrow(() -> new AppException(PaymentErrorCode.PAYMENT_NOT_FOUND));

        payout.setStatus(PayoutStatus.PAID);
        payout.setPaidAt(LocalDateTime.now());
        hostPayoutRepository.save(payout);

        log.info("Payout {} marked as PAID. Host {} receives {}", payoutId, payout.getHostId(), payout.getHostAmount());
    }
}
