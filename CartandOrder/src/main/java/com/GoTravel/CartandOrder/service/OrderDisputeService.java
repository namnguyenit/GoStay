package com.GoTravel.CartandOrder.service;

import com.GoTravel.CartandOrder.client.InventoryClient;
import com.GoTravel.CartandOrder.client.PaymentClient;
import com.GoTravel.CartandOrder.dto.request.CreateOrderDisputeRequest;
import com.GoTravel.CartandOrder.dto.request.ForceCancelOrderRequest;
import com.GoTravel.CartandOrder.dto.request.RefundOrderRequest;
import com.GoTravel.CartandOrder.dto.request.ResolveOrderDisputeRequest;
import com.GoTravel.CartandOrder.dto.response.OrderDisputeResponse;
import com.GoTravel.CartandOrder.entity.Order;
import com.GoTravel.CartandOrder.entity.OrderDispute;
import com.GoTravel.CartandOrder.enums.DisputeStatus;
import com.GoTravel.CartandOrder.enums.OrderStatus;
import com.GoTravel.CartandOrder.exeption.AppException;
import com.GoTravel.CartandOrder.exeption.OrderErrorCode;
import com.GoTravel.CartandOrder.repository.OrderDisputeRepository;
import com.GoTravel.CartandOrder.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderDisputeService {
    private final OrderDisputeRepository disputeRepository;
    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;
    private final InventoryClient inventoryClient;

    private static final List<DisputeStatus> ACTIVE_STATUSES = List.of(DisputeStatus.OPEN, DisputeStatus.IN_REVIEW);

    @Transactional
    public OrderDisputeResponse createDispute(UUID userId, CreateOrderDisputeRequest request) {
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), userId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.COMPLETED) {
            throw new AppException(OrderErrorCode.INVALID_ORDER_STATE);
        }

        disputeRepository.findFirstByOrderIdAndStatusIn(order.getId(), ACTIVE_STATUSES)
                .ifPresent(existing -> {
                    throw new AppException(OrderErrorCode.DISPUTE_ALREADY_OPEN);
                });

        OrderDispute dispute = OrderDispute.builder()
                .orderId(order.getId())
                .userId(userId)
                .reason(request.getReason().trim())
                .description(request.getDescription())
                .status(DisputeStatus.OPEN)
                .build();

        return toResponse(disputeRepository.save(dispute), order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDisputeResponse> getMyDisputes(UUID userId, Pageable pageable) {
        return disputeRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderDisputeResponse> getAdminDisputes(DisputeStatus status, Pageable pageable) {
        Page<OrderDispute> page = status == null
                ? disputeRepository.findAllByOrderByCreatedAtDesc(pageable)
                : disputeRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public OrderDisputeResponse resolveDispute(UUID adminId, UUID disputeId, ResolveOrderDisputeRequest request) {
        OrderDispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));
        Order order = orderRepository.findById(dispute.getOrderId())
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));

        String action = request.getAction().trim().toUpperCase();
        if ("REFUND".equals(action)) {
            forceCancelAndRefund(order, request.getAdminNote());
            dispute.setStatus(DisputeStatus.REFUNDED);
        } else if ("REJECT".equals(action)) {
            dispute.setStatus(DisputeStatus.REJECTED);
        } else {
            dispute.setStatus(DisputeStatus.RESOLVED);
        }

        dispute.setAdminNote(request.getAdminNote());
        dispute.setResolvedBy(adminId);
        dispute.setResolvedAt(LocalDateTime.now());
        return toResponse(disputeRepository.save(dispute), order);
    }

    @Transactional
    public void forceCancelOrder(UUID orderId, ForceCancelOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));
        forceCancelAndRefund(order, request == null ? null : request.getReason());
    }

    private void forceCancelAndRefund(Order order, String reason) {
        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.COMPLETED) {
            throw new AppException(OrderErrorCode.INVALID_ORDER_STATE);
        }

        paymentClient.refundOrder(order.getId(), RefundOrderRequest.builder()
                .reason(reason)
                .build());

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        try {
            inventoryClient.cancelLock(order.getId());
        } catch (Exception e) {
            log.warn("Failed to release inventory while force-canceling order {}", order.getId(), e);
        }
    }

    private OrderDisputeResponse toResponse(OrderDispute dispute) {
        Order order = orderRepository.findById(dispute.getOrderId()).orElse(null);
        return toResponse(dispute, order);
    }

    private OrderDisputeResponse toResponse(OrderDispute dispute, Order order) {
        Order.CustomerInfo customer = order == null ? null : order.getCustomerInfo();
        return OrderDisputeResponse.builder()
                .disputeId(dispute.getId())
                .orderId(dispute.getOrderId())
                .userId(dispute.getUserId())
                .orderNumber(order == null ? null : order.getOrderNumber())
                .orderStatus(order == null ? null : order.getStatus().name())
                .orderAmount(order == null ? null : order.getTotalAmount())
                .customerName(customer == null ? null : customer.getFullName())
                .customerEmail(customer == null ? null : customer.getEmail())
                .customerPhone(customer == null ? null : customer.getPhone())
                .reason(dispute.getReason())
                .description(dispute.getDescription())
                .status(dispute.getStatus().name())
                .adminNote(dispute.getAdminNote())
                .resolvedBy(dispute.getResolvedBy())
                .resolvedAt(dispute.getResolvedAt())
                .createdAt(dispute.getCreatedAt())
                .updatedAt(dispute.getUpdatedAt())
                .build();
    }
}
