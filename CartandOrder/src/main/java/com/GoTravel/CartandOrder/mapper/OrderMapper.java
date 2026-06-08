package com.GoTravel.CartandOrder.mapper;

import com.GoTravel.CartandOrder.dto.response.OrderResponse;
import com.GoTravel.CartandOrder.entity.Order;
import com.GoTravel.CartandOrder.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "itemId", source = "id")
    OrderResponse.OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "status", expression = "java(order.getStatus().name())")
    OrderResponse toOrderResponse(Order order);
}
