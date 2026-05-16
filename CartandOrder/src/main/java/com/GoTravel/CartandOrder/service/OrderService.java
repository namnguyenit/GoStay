package com.GoTravel.CartandOrder.service;

import com.GoTravel.CartandOrder.client.InventoryClient;
import com.GoTravel.CartandOrder.dto.request.BatchLockRequest;
import com.GoTravel.CartandOrder.dto.request.BookNowRequest;
import com.GoTravel.CartandOrder.dto.request.CartItemRequest;
import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import com.GoTravel.CartandOrder.dto.response.BatchLockResponse;
import com.GoTravel.CartandOrder.dto.response.OrderResponse;
import com.GoTravel.CartandOrder.entity.Cart;
import com.GoTravel.CartandOrder.entity.CartItem;
import com.GoTravel.CartandOrder.entity.Order;
import com.GoTravel.CartandOrder.entity.OrderItem;
import com.GoTravel.CartandOrder.enums.OrderStatus;
import com.GoTravel.CartandOrder.exeption.AppException;
import com.GoTravel.CartandOrder.exeption.OrderErrorCode;
import com.GoTravel.CartandOrder.mapper.OrderMapper;
import com.GoTravel.CartandOrder.repository.CartRepository;
import com.GoTravel.CartandOrder.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final InventoryClient inventoryClient;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderResponse checkoutCart(UUID userId, Order.CustomerInfo customerInfo) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(OrderErrorCode.CART_NOT_FOUND));

        if (cart.getItems().isEmpty()) {
            throw new AppException(OrderErrorCode.CART_IS_EMPTY);
        }

        Order order = createOrderFromCart(cart, customerInfo);
        order = orderRepository.save(order);

        lockInventory(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse bookNow(UUID userId, BookNowRequest request) {
        Order order = createOrderFromSingleItem(userId, request);
        order = orderRepository.save(order);

        lockInventory(order);

        return orderMapper.toOrderResponse(order);
    }

    private void lockInventory(Order order) {
        BatchLockRequest lockRequest = BatchLockRequest.builder()
                .orderId(order.getId())
                .items(order.getItems().stream().map(item -> 
                    BatchLockRequest.LockItemRequest.builder()
                        .listingId(item.getListingId())
                        .startDate(item.getStartDate())
                        .endDate(item.getEndDate())
                        .timeSlot(item.getTimeSlot())
                        .quantity(item.getQuantity())
                        .build()
                ).collect(Collectors.toList()))
                .build();

        try {
            ApiResponse<BatchLockResponse> lockResponse = inventoryClient.batchLock(lockRequest);
            if (lockResponse.isSuccess() && lockResponse.getData() != null) {
                order.setStatus(OrderStatus.PAYMENT_PENDING);
                order.setExpiresAt(lockResponse.getData().getExpiresAt());
                orderRepository.save(order);
            } else {
                throw new AppException(OrderErrorCode.INVENTORY_LOCK_FAILED);
            }
        } catch (Exception e) {
            log.error("Failed to lock inventory for order {}", order.getId(), e);
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new AppException(OrderErrorCode.INVENTORY_LOCK_FAILED);
        }
    }

    private Order createOrderFromCart(Cart cart, Order.CustomerInfo customerInfo) {
        BigDecimal totalAmount = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .userId(cart.getUserId())
                .orderNumber("ORD-" + System.currentTimeMillis())
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .customerInfo(customerInfo)
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(ci -> OrderItem.builder()
                .order(order)
                .listingId(ci.getListingId())
                .listingTitle(ci.getListingTitle())
                .thumbnailUrl(ci.getThumbnailUrl())
                .startDate(ci.getStartDate())
                .endDate(ci.getEndDate())
                .timeSlot(ci.getTimeSlot())
                .quantity(ci.getQuantity())
                .unitPrice(ci.getUnitPrice())
                .totalPrice(ci.getTotalPrice())
                .build()).collect(Collectors.toList());

        order.setItems(orderItems);
        return order;
    }

    private Order createOrderFromSingleItem(UUID userId, BookNowRequest request) {
        CartItemRequest itemReq = request.getItem();
        BigDecimal totalPrice = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

        Order.CustomerInfo info = new Order.CustomerInfo(request.getFullName(), request.getEmail(), request.getPhone());

        Order order = Order.builder()
                .userId(userId)
                .orderNumber("ORD-" + System.currentTimeMillis())
                .status(OrderStatus.PENDING)
                .totalAmount(totalPrice)
                .customerInfo(info)
                .build();

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .listingId(itemReq.getListingId())
                .listingTitle(itemReq.getListingTitle())
                .thumbnailUrl(itemReq.getThumbnailUrl())
                .startDate(itemReq.getStartDate())
                .endDate(itemReq.getEndDate())
                .timeSlot(itemReq.getTimeSlot())
                .quantity(itemReq.getQuantity())
                .unitPrice(itemReq.getUnitPrice())
                .totalPrice(totalPrice)
                .build();

        order.getItems().add(orderItem);
        return order;
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(orderMapper::toOrderResponse);
    }

    @Transactional
    public void cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));
        
        if (!order.getUserId().equals(userId)) {
            throw new AppException(OrderErrorCode.ORDER_NOT_FOUND);
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            throw new AppException(OrderErrorCode.INVALID_ORDER_STATE);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        try {
            inventoryClient.cancelLock(orderId);
        } catch (Exception e) {
            log.error("Failed to cancel lock in inventory for order {}", orderId, e);
        }
    }

    @Transactional
    public void confirmPayment(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        try {
            inventoryClient.confirmLock(orderId);
        } catch (Exception e) {
            log.error("Failed to confirm lock in inventory for order {}", orderId, e);
        }
    }

    @Transactional
    public void failPayment(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(OrderErrorCode.ORDER_NOT_FOUND));

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        try {
            inventoryClient.cancelLock(orderId);
        } catch (Exception e) {
            log.error("Failed to cancel lock in inventory for order {}", orderId, e);
        }
    }
}
