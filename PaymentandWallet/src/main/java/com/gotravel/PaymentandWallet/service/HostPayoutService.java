package com.gotravel.PaymentandWallet.service;

import com.gotravel.PaymentandWallet.dto.response.AdminPaymentSummaryResponse;
import com.gotravel.PaymentandWallet.dto.response.AdminRevenueReportResponse;
import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.entity.HostPayout;
import com.gotravel.PaymentandWallet.enums.PaymentStatus;
import com.gotravel.PaymentandWallet.enums.PayoutStatus;
import com.gotravel.PaymentandWallet.exeption.AppException;
import com.gotravel.PaymentandWallet.exeption.PaymentErrorCode;
import com.gotravel.PaymentandWallet.mapper.PaymentMapper;
import com.gotravel.PaymentandWallet.repository.HostPayoutRepository;
import com.gotravel.PaymentandWallet.repository.PaymentRequestRepository;
import com.gotravel.PaymentandWallet.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
    private final PaymentRequestRepository paymentRequestRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentMapper paymentMapper;

    /**
     * Host xem danh sách các khoản tiền sẽ nhận (phân trang).
     */
    @Transactional(readOnly = true)
    public Page<HostPayoutResponse> getPayoutsByHost(UUID hostId, Pageable pageable) {
        return hostPayoutRepository.findByHostIdOrderByCreatedAtDesc(hostId, pageable)
                .map(paymentMapper::toHostPayoutResponse);
    }

    @Transactional(readOnly = true)
    public Page<HostPayoutResponse> getAllPayouts(Pageable pageable) {
        return hostPayoutRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(paymentMapper::toHostPayoutResponse);
    }

    @Transactional(readOnly = true)
    public AdminPaymentSummaryResponse getAdminSummary() {
        return AdminPaymentSummaryResponse.builder()
                .totalPaymentRequests(paymentRequestRepository.count())
                .pendingPayments(paymentRequestRepository.countByStatus(PaymentStatus.PENDING))
                .completedPayments(paymentRequestRepository.countByStatus(PaymentStatus.COMPLETED))
                .failedPayments(paymentRequestRepository.countByStatus(PaymentStatus.FAILED))
                .expiredPayments(paymentRequestRepository.countByStatus(PaymentStatus.EXPIRED))
                .totalRequestedAmount(paymentRequestRepository.sumAmount())
                .completedPaymentAmount(paymentRequestRepository.sumAmountByStatus(PaymentStatus.COMPLETED))
                .totalTransactionAmount(paymentTransactionRepository.sumAmount())
                .totalPayouts(hostPayoutRepository.count())
                .pendingPayouts(hostPayoutRepository.countByStatus(PayoutStatus.PENDING))
                .requestedPayouts(hostPayoutRepository.countByStatus(PayoutStatus.REQUESTED))
                .paidPayouts(hostPayoutRepository.countByStatus(PayoutStatus.PAID))
                .cancelledPayouts(hostPayoutRepository.countByStatus(PayoutStatus.CANCELLED))
                .totalPayoutAmount(hostPayoutRepository.sumTotalAmount())
                .totalHostAmount(hostPayoutRepository.sumHostAmount())
                .totalCommissionAmount(hostPayoutRepository.sumCommissionAmount())
                .pendingHostAmount(hostPayoutRepository.sumHostAmountByStatus(PayoutStatus.PENDING))
                .requestedHostAmount(hostPayoutRepository.sumHostAmountByStatus(PayoutStatus.REQUESTED))
                .paidHostAmount(hostPayoutRepository.sumHostAmountByStatus(PayoutStatus.PAID))
                .paidCommissionAmount(hostPayoutRepository.sumCommissionAmountByStatus(PayoutStatus.PAID))
                .build();
    }

    @Transactional(readOnly = true)
    public AdminRevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDate safeStart = startDate != null ? startDate : LocalDate.now().minusDays(29);
        LocalDate safeEnd = endDate != null ? endDate : LocalDate.now();
        if (safeEnd.isBefore(safeStart)) {
            LocalDate tmp = safeStart;
            safeStart = safeEnd;
            safeEnd = tmp;
        }

        List<Object[]> rows = hostPayoutRepository.getDailyRevenueReport(
                safeStart.atStartOfDay(),
                safeEnd.plusDays(1).atStartOfDay()
        );

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal hostAmount = BigDecimal.ZERO;
        BigDecimal commissionAmount = BigDecimal.ZERO;
        long payoutCount = 0;
        List<AdminRevenueReportResponse.DailyRevenue> daily = new ArrayList<>();

        for (Object[] row : rows) {
            LocalDate date = toLocalDate(row[0]);
            BigDecimal rowTotal = toBigDecimal(row[1]);
            BigDecimal rowHost = toBigDecimal(row[2]);
            BigDecimal rowCommission = toBigDecimal(row[3]);
            long rowCount = ((Number) row[4]).longValue();

            totalAmount = totalAmount.add(rowTotal);
            hostAmount = hostAmount.add(rowHost);
            commissionAmount = commissionAmount.add(rowCommission);
            payoutCount += rowCount;

            daily.add(AdminRevenueReportResponse.DailyRevenue.builder()
                    .date(date)
                    .totalAmount(rowTotal)
                    .hostAmount(rowHost)
                    .commissionAmount(rowCommission)
                    .payoutCount(rowCount)
                    .build());
        }

        return AdminRevenueReportResponse.builder()
                .startDate(safeStart)
                .endDate(safeEnd)
                .totalAmount(totalAmount)
                .hostAmount(hostAmount)
                .commissionAmount(commissionAmount)
                .payoutCount(payoutCount)
                .daily(daily)
                .build();
    }

    @Transactional
    public void markAsPaid(UUID payoutId) {
        HostPayout payout = hostPayoutRepository.findById(payoutId)
                .orElseThrow(() -> new AppException(PaymentErrorCode.PAYMENT_NOT_FOUND));

        payout.setStatus(PayoutStatus.PAID);
        payout.setPaidAt(LocalDateTime.now());
        hostPayoutRepository.save(payout);

        log.info("Payout {} marked as PAID. Host {} receives {}", payoutId, payout.getHostId(), payout.getHostAmount());
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof Date sqlDate) return sqlDate.toLocalDate();
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toLocalDateTime().toLocalDate();
        if (value instanceof LocalDate localDate) return localDate;
        return LocalDate.parse(String.valueOf(value));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bigDecimal) return bigDecimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        return new BigDecimal(String.valueOf(value));
    }

    @Transactional
    public void markAllAsPaidByHost(UUID hostId) {
        java.util.List<HostPayout> payouts = hostPayoutRepository.findByHostIdOrderByCreatedAtDesc(hostId, Pageable.unpaged())
                .stream()
                .filter(p -> p.getStatus() == PayoutStatus.PENDING || p.getStatus() == PayoutStatus.REQUESTED)
                .toList();

        if (payouts.isEmpty()) {
            throw new AppException(PaymentErrorCode.PAYMENT_NOT_FOUND);
        }

        LocalDateTime now = LocalDateTime.now();
        for (HostPayout payout : payouts) {
            payout.setStatus(PayoutStatus.PAID);
            payout.setPaidAt(now);
            hostPayoutRepository.save(payout);
        }

        log.info("Marked {} payouts as PAID for Host {}", payouts.size(), hostId);
    }

    /**
     * Host yêu cầu rút tiền cho tất cả các khoản thu nhập đang PENDING.
     */
    @Transactional
    public void requestWithdrawal(UUID hostId) {
        java.util.List<HostPayout> pendingPayouts = hostPayoutRepository.findByHostIdOrderByCreatedAtDesc(hostId, Pageable.unpaged())
            .stream()
            .filter(p -> p.getStatus() == PayoutStatus.PENDING)
            .toList();

        if (pendingPayouts.isEmpty()) {
            throw new AppException(PaymentErrorCode.INVALID_ORDER_FOR_PAYMENT);
        }

        for (HostPayout payout : pendingPayouts) {
            payout.setStatus(PayoutStatus.REQUESTED);
            hostPayoutRepository.save(payout);
        }
        
        log.info("Host {} requested withdrawal for {} payouts", hostId, pendingPayouts.size());
    }
}
