package com.GoTravel.CartandOrder.mapper;

import com.GoTravel.CartandOrder.dto.request.CartItemRequest;
import com.GoTravel.CartandOrder.dto.response.CartResponse;
import com.GoTravel.CartandOrder.entity.CartItem;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T16:06:56+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Override
    public CartItem toCartItem(CartItemRequest request) {
        if ( request == null ) {
            return null;
        }

        CartItem.CartItemBuilder cartItem = CartItem.builder();

        cartItem.listingId( request.getListingId() );
        cartItem.listingTitle( request.getListingTitle() );
        cartItem.thumbnailUrl( request.getThumbnailUrl() );
        cartItem.startDate( request.getStartDate() );
        cartItem.endDate( request.getEndDate() );
        cartItem.timeSlot( request.getTimeSlot() );
        cartItem.quantity( request.getQuantity() );
        cartItem.unitPrice( request.getUnitPrice() );

        cartItem.totalPrice( calculateTotal(request) );

        return cartItem.build();
    }

    @Override
    public CartResponse.CartItemResponse toCartItemResponse(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }

        CartResponse.CartItemResponse.CartItemResponseBuilder cartItemResponse = CartResponse.CartItemResponse.builder();

        cartItemResponse.itemId( cartItem.getId() );
        cartItemResponse.listingId( cartItem.getListingId() );
        cartItemResponse.listingTitle( cartItem.getListingTitle() );
        cartItemResponse.thumbnailUrl( cartItem.getThumbnailUrl() );
        cartItemResponse.startDate( cartItem.getStartDate() );
        cartItemResponse.endDate( cartItem.getEndDate() );
        cartItemResponse.timeSlot( cartItem.getTimeSlot() );
        cartItemResponse.quantity( cartItem.getQuantity() );
        cartItemResponse.unitPrice( cartItem.getUnitPrice() );
        cartItemResponse.totalPrice( cartItem.getTotalPrice() );

        return cartItemResponse.build();
    }
}
