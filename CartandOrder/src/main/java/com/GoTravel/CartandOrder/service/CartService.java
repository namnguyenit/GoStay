package com.GoTravel.CartandOrder.service;

import com.GoTravel.CartandOrder.dto.request.CartItemRequest;
import com.GoTravel.CartandOrder.dto.request.UpdateCartItemRequest;
import com.GoTravel.CartandOrder.dto.response.CartResponse;
import com.GoTravel.CartandOrder.entity.Cart;
import com.GoTravel.CartandOrder.entity.CartItem;
import com.GoTravel.CartandOrder.exeption.AppException;
import com.GoTravel.CartandOrder.exeption.OrderErrorCode;
import com.GoTravel.CartandOrder.mapper.CartMapper;
import com.GoTravel.CartandOrder.repository.CartItemRepository;
import com.GoTravel.CartandOrder.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartMapper cartMapper;

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createEmptyCart(userId));
        return cartMapper.toCartResponse(cart);
    }

    private Cart createEmptyCart(UUID userId) {
        Cart cart = Cart.builder().userId(userId).build();
        return cartRepository.save(cart);
    }

    @Transactional
    public CartResponse addItemToCart(UUID userId, CartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createEmptyCart(userId));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getListingId().equals(request.getListingId()) &&
                        item.getStartDate().equals(request.getStartDate()) &&
                        item.getEndDate().equals(request.getEndDate()) &&
                        (request.getTimeSlot() == null || request.getTimeSlot().equals(item.getTimeSlot())))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        } else {
            CartItem newItem = cartMapper.toCartItem(request);
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public void removeItemFromCart(UUID userId, UUID itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(OrderErrorCode.CART_NOT_FOUND));

        CartItem itemToRemove = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(OrderErrorCode.CART_ITEM_NOT_FOUND));

        cart.getItems().remove(itemToRemove);
        cartRepository.save(cart);
    }

    @Transactional
    public CartResponse updateCartItem(UUID userId, UUID itemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(OrderErrorCode.CART_NOT_FOUND));

        CartItem itemToUpdate = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(OrderErrorCode.CART_ITEM_NOT_FOUND));

        if (request.getQuantity() != null) itemToUpdate.setQuantity(request.getQuantity());
        if (request.getStartDate() != null) itemToUpdate.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) itemToUpdate.setEndDate(request.getEndDate());
        if (request.getTimeSlot() != null) itemToUpdate.setTimeSlot(request.getTimeSlot());

        itemToUpdate.setTotalPrice(itemToUpdate.getUnitPrice().multiply(BigDecimal.valueOf(itemToUpdate.getQuantity())));

        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }
}
