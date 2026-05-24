package com.gotravel.PaymentandWallet.service;

import com.gotravel.PaymentandWallet.client.OrderClient;
import com.gotravel.PaymentandWallet.configuration.SepayConfig;
import com.gotravel.PaymentandWallet.dto.request.CreatePaymentRequest;
import com.gotravel.PaymentandWallet.dto.request.SepayWebhookRequest;
import com.gotravel.PaymentandWallet.dto.response.HostPayoutResponse;
import com.gotravel.PaymentandWallet.dto.response.PaymentResponse;
import com.gotravel.PaymentandWallet.entity.HostPayout;
import com.gotravel.PaymentandWallet.entity.PaymentRequest;
import com.gotravel.PaymentandWallet.entity.PaymentTransaction;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRequestRepository paymentRequestRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final HostPayoutRepository hostPayoutRepository;
    private final OrderClient orderClient;
    private final PaymentMapper paymentMapper;
    private final SepayConfig sepayConfig;

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5% hoa hồng GoStay
    private static final Pattern PAYMENT_CODE_PATTERN = Pattern.compile("(GS[A-Z0-9]{10})");

    /**
     * Tạo yêu cầu thanh toán mới cho một đơn hàng.
     * Sinh mã thanh toán duy nhất và URL QR VietQR từ SePay.
     */
    @Transactional
    public PaymentResponse createPayment(UUID userId, CreatePaymentRequest request) {
        String paymentCode = generatePaymentCode();

        String qrUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                sepayConfig.getBankAccount(),
                sepayConfig.getBankName(),
                request.getAmount().toBigInteger().toString(),
                URLEncoder.encode(paymentCode, StandardCharsets.UTF_8)
        );

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .orderId(request.getOrderId())
                .userId(userId)
                .hostId(request.getHostId())
                .paymentCode(paymentCode)
                .amount(request.getAmount())
                .status(PaymentStatus.PENDING)
                .qrUrl(qrUrl)
                .bankAccount(sepayConfig.getBankAccount())
                .bankName(sepayConfig.getBankName())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        paymentRequest = paymentRequestRepository.save(paymentRequest);
        log.info("Created payment request {} for order {}", paymentCode, request.getOrderId());

        return paymentMapper.toPaymentResponse(paymentRequest);
    }

    /**
     * Xử lý webhook từ SePay khi ngân hàng báo có tiền vào.
     * So khớp nội dung chuyển khoản với payment_code trong hệ thống.
     */
    @Transactional
    public void handleSepayWebhook(SepayWebhookRequest webhook) {
        if (webhook.getId() == null || webhook.getContent() == null) {
            throw new AppException(PaymentErrorCode.INVALID_WEBHOOK);
        }

        if (paymentTransactionRepository.existsBySepayId(webhook.getId())) {
            throw new AppException(PaymentErrorCode.DUPLICATE_TRANSACTION);
        }

        String paymentCode = extractPaymentCode(webhook.getContent());
        if (paymentCode == null) {
            log.warn("Webhook received but no payment code found in content: {}", webhook.getContent());
            return;
        }

        PaymentRequest paymentRequest = paymentRequestRepository.findByPaymentCode(paymentCode)
                .orElse(null);

        if (paymentRequest == null) {
            log.warn("Payment code {} not found in system", paymentCode);
            return;
        }

        if (paymentRequest.getStatus() == PaymentStatus.COMPLETED) {
            throw new AppException(PaymentErrorCode.PAYMENT_ALREADY_COMPLETED);
        }

        if (paymentRequest.getStatus() == PaymentStatus.EXPIRED) {
            throw new AppException(PaymentErrorCode.PAYMENT_EXPIRED);
        }

        PaymentTransaction transaction = PaymentTransaction.builder()
                .paymentRequest(paymentRequest)
                .amount(webhook.getTransferAmount())
                .gateway(webhook.getGateway())
                .senderAccount(webhook.getAccountNumber())
                .content(webhook.getContent())
                .referenceCode(webhook.getReferenceCode())
                .sepayId(webhook.getId())
                .transactionDate(parseTransactionDate(webhook.getTransactionDate()))
                .build();

        paymentTransactionRepository.save(transaction);

        paymentRequest.setStatus(PaymentStatus.COMPLETED);
        paymentRequest.setPaidAt(LocalDateTime.now());
        paymentRequestRepository.save(paymentRequest);

        // Tính hoa hồng 5% cho GoStay, 95% cho Host
        BigDecimal commissionAmount = paymentRequest.getAmount().multiply(COMMISSION_RATE);
        BigDecimal hostAmount = paymentRequest.getAmount().subtract(commissionAmount);

        HostPayout payout = HostPayout.builder()
                .paymentRequestId(paymentRequest.getId())
                .orderId(paymentRequest.getOrderId())
                .hostId(paymentRequest.getHostId())
                .totalAmount(paymentRequest.getAmount())
                .commissionRate(COMMISSION_RATE)
                .commissionAmount(commissionAmount)
                .hostAmount(hostAmount)
                .status(PayoutStatus.PENDING)
                .build();

        hostPayoutRepository.save(payout);

        log.info("Payment {} completed for order {}. Total: {}, Commission(5%): {}, Host receives: {}",
                paymentCode, paymentRequest.getOrderId(),
                paymentRequest.getAmount(), commissionAmount, hostAmount);

        try {
            orderClient.notifyPaymentSuccess(paymentRequest.getOrderId());
        } catch (Exception e) {
            log.error("Failed to notify CartOrder about payment success for order {}", paymentRequest.getOrderId(), e);
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID paymentId) {
        PaymentRequest paymentRequest = paymentRequestRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(PaymentErrorCode.PAYMENT_NOT_FOUND));
        return paymentMapper.toPaymentResponse(paymentRequest);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId) {
        PaymentRequest paymentRequest = paymentRequestRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(PaymentErrorCode.PAYMENT_NOT_FOUND));
        return paymentMapper.toPaymentResponse(paymentRequest);
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPaymentHistory(UUID userId, Pageable pageable) {
        return paymentRequestRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(paymentMapper::toPaymentResponse);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatusByOrderId(UUID orderId) {
        return getPaymentByOrderId(orderId);
    }

    private String generatePaymentCode() {
        return "GS" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    private String extractPaymentCode(String content) {
        if (content == null) return null;
        Matcher matcher = PAYMENT_CODE_PATTERN.matcher(content.toUpperCase());
        return matcher.find() ? matcher.group(1) : null;
    }

    private LocalDateTime parseTransactionDate(String dateStr) {
        if (dateStr == null) return null;
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            return null;
        }
    }
}
