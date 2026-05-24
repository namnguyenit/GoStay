package com.GoTravel.CartandOrder.mapper;

import com.GoTravel.CartandOrder.dto.response.OrderResponse;
import com.GoTravel.CartandOrder.entity.Order;
import com.GoTravel.CartandOrder.entity.OrderItem;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-18T16:06:56+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse.OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }

        OrderResponse.OrderItemResponse.OrderItemResponseBuilder orderItemResponse = OrderResponse.OrderItemResponse.builder();

        orderItemResponse.itemId( orderItem.getId() );
        orderItemResponse.listingId( orderItem.getListingId() );
        orderItemResponse.listingTitle( orderItem.getListingTitle() );
        orderItemResponse.thumbnailUrl( orderItem.getThumbnailUrl() );
        orderItemResponse.startDate( orderItem.getStartDate() );
        orderItemResponse.endDate( orderItem.getEndDate() );
        orderItemResponse.timeSlot( orderItem.getTimeSlot() );
        orderItemResponse.quantity( orderItem.getQuantity() );
        orderItemResponse.unitPrice( orderItem.getUnitPrice() );
        orderItemResponse.totalPrice( orderItem.getTotalPrice() );

        return orderItemResponse.build();
    }

    @Override
    public OrderResponse toOrderResponse(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        orderResponse.orderId( order.getId() );
        orderResponse.orderNumber( order.getOrderNumber() );
        orderResponse.totalAmount( order.getTotalAmount() );
        orderResponse.currency( order.getCurrency() );
        orderResponse.expiresAt( order.getExpiresAt() );
        orderResponse.items( orderItemListToOrderItemResponseList( order.getItems() ) );

        orderResponse.status( order.getStatus().name() );

        return orderResponse.build();
    }

    protected List<OrderResponse.OrderItemResponse> orderItemListToOrderItemResponseList(List<OrderItem> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderResponse.OrderItemResponse> list1 = new ArrayList<OrderResponse.OrderItemResponse>( list.size() );
        for ( OrderItem orderItem : list ) {
            list1.add( toOrderItemResponse( orderItem ) );
        }

        return list1;
    }
}
