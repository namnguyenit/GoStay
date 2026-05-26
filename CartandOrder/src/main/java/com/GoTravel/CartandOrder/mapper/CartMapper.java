package com.GoTravel.CartandOrder.mapper;

import com.GoTravel.CartandOrder.dto.request.CartItemRequest;
import com.GoTravel.CartandOrder.dto.response.CartResponse;
import com.GoTravel.CartandOrder.entity.Cart;
import com.GoTravel.CartandOrder.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "totalPrice", expression = "java(calculateTotal(request))")
    CartItem toCartItem(CartItemRequest request);

    @Mapping(target = "itemId", source = "id")
    CartResponse.CartItemResponse toCartItemResponse(CartItem cartItem);

    default CartResponse toCartResponse(Cart cart) {
        if (cart == null) return null;

        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::toCartItemResponse)
                .toList();

        BigDecimal cartTotal = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .cartTotal(cartTotal)
                .build();
    }

    default BigDecimal calculateTotal(CartItemRequest request) {
        if (request.getUnitPrice() == null || request.getQuantity() == null) return BigDecimal.ZERO;
        return request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
    }
}
