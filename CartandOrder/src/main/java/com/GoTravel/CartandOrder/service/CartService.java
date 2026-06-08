package com.GoTravel.CartandOrder.service;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.GoTravel.CartandOrder.client.CatalogClient;
import com.GoTravel.CartandOrder.dto.request.CartItemRequest;
import com.GoTravel.CartandOrder.dto.request.UpdateCartItemRequest;
import com.GoTravel.CartandOrder.dto.response.ApiResponse;
import com.GoTravel.CartandOrder.dto.response.CartResponse;
import com.GoTravel.CartandOrder.dto.response.CatalogListingResponse;
import com.GoTravel.CartandOrder.entity.Cart;
import com.GoTravel.CartandOrder.entity.CartItem;
import com.GoTravel.CartandOrder.exeption.AppException;
import com.GoTravel.CartandOrder.exeption.OrderErrorCode;
import com.GoTravel.CartandOrder.mapper.CartMapper;
import com.GoTravel.CartandOrder.repository.CartItemRepository;
import com.GoTravel.CartandOrder.repository.CartRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartMapper cartMapper;
    private final CatalogClient catalogClient;

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return CartResponse.builder()
                    .userId(userId)
                    .items(java.util.List.of())
                    .cartTotal(BigDecimal.ZERO)
                    .build();
        }
        return cartMapper.toCartResponse(cart);
    }

    private Cart createEmptyCart(UUID userId) {
        try {
            Cart cart = Cart.builder().userId(userId).build();
            return cartRepository.save(cart);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return cartRepository.findByUserId(userId).orElseThrow();
        }
    }

    @Transactional
    public CartResponse addItemToCart(UUID userId, CartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            cart = createEmptyCart(userId);
        }
        validateCartItemRequest(request);
        CartItemRequest trustedRequest = buildTrustedCartItemRequest(request);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getListingId().equals(trustedRequest.getListingId()) &&
                        item.getStartDate().equals(trustedRequest.getStartDate()) &&
                        item.getEndDate().equals(trustedRequest.getEndDate()) &&
                        Objects.equals(trustedRequest.getTimeSlot(), item.getTimeSlot()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            applyTrustedListingSnapshot(item, trustedRequest);
            item.setQuantity(item.getQuantity() + trustedRequest.getQuantity());
            item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        } else {
            CartItem newItem = cartMapper.toCartItem(trustedRequest);
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

        validateCartItemDates(itemToUpdate.getStartDate(), itemToUpdate.getEndDate());
        refreshCartItemFromCatalog(itemToUpdate);
        itemToUpdate.setTotalPrice(itemToUpdate.getUnitPrice().multiply(BigDecimal.valueOf(itemToUpdate.getQuantity())));

        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    private CartItemRequest buildTrustedCartItemRequest(CartItemRequest request) {
        CatalogListingResponse listing = getActiveListing(request.getListingId());

        return CartItemRequest.builder()
                .listingId(listing.getId())
                .hostId(listing.getHostId())
                .listingTitle(listing.getTitle())
                .thumbnailUrl(listing.getThumbnailUrl())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .timeSlot(request.getTimeSlot())
                .quantity(request.getQuantity())
                .unitPrice(listing.getBasePrice())
                .build();
    }

    private void validateCartItemRequest(CartItemRequest request) {
        if (request == null
                || request.getListingId() == null
                || request.getStartDate() == null
                || request.getEndDate() == null
                || request.getQuantity() == null
                || request.getQuantity() < 1) {
            throw new AppException(OrderErrorCode.INVALID_CART_ITEM_REQUEST);
        }

        validateCartItemDates(request.getStartDate(), request.getEndDate());
    }

    private void validateCartItemDates(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        java.time.LocalDate today = java.time.LocalDate.now();
        if (startDate == null || endDate == null
                || startDate.isBefore(today)
                || endDate.isBefore(today)
                || endDate.isBefore(startDate)) {
            throw new AppException(OrderErrorCode.INVALID_CART_ITEM_REQUEST);
        }
    }

    private void refreshCartItemFromCatalog(CartItem item) {
        CatalogListingResponse listing = getActiveListing(item.getListingId());
        item.setHostId(listing.getHostId());
        item.setListingTitle(listing.getTitle());
        item.setThumbnailUrl(listing.getThumbnailUrl());
        item.setUnitPrice(listing.getBasePrice());
    }

    private void applyTrustedListingSnapshot(CartItem item, CartItemRequest trustedRequest) {
        item.setHostId(trustedRequest.getHostId());
        item.setListingTitle(trustedRequest.getListingTitle());
        item.setThumbnailUrl(trustedRequest.getThumbnailUrl());
        item.setUnitPrice(trustedRequest.getUnitPrice());
    }

    private CatalogListingResponse getActiveListing(UUID listingId) {
        try {
            ApiResponse<CatalogListingResponse> response = catalogClient.getListingDetail(listingId);
            CatalogListingResponse listing = response == null ? null : response.getData();
            if (listing == null || listing.getHostId() == null || listing.getBasePrice() == null
                    || !"ACTIVE".equalsIgnoreCase(listing.getStatus())) {
                throw new AppException(OrderErrorCode.LISTING_NOT_AVAILABLE);
            }

            return listing;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Cannot load trusted listing snapshot for listing {}", listingId, e);
            throw new AppException(OrderErrorCode.LISTING_NOT_AVAILABLE);
        }
    }
}
