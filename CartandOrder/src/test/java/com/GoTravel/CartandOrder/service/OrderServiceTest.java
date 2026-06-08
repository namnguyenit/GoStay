package com.GoTravel.CartandOrder.service;

import com.GoTravel.CartandOrder.client.CatalogClient;
import com.GoTravel.CartandOrder.client.InventoryClient;
import com.GoTravel.CartandOrder.enums.OrderStatus;
import com.GoTravel.CartandOrder.mapper.OrderMapper;
import com.GoTravel.CartandOrder.repository.CartRepository;
import com.GoTravel.CartandOrder.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    OrderRepository orderRepository;

    @Mock
    CartRepository cartRepository;

    @Mock
    InventoryClient inventoryClient;

    @Mock
    CatalogClient catalogClient;

    @Mock
    OrderMapper orderMapper;

    @Test
    void reviewEligibilityUsesCompletedOrdersOnly() {
        UUID userId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        when(orderRepository.hasPurchasedListing(userId, listingId, List.of(OrderStatus.COMPLETED)))
                .thenReturn(true);
        OrderService service = new OrderService(
                orderRepository,
                cartRepository,
                inventoryClient,
                catalogClient,
                orderMapper
        );

        boolean eligible = service.hasCompletedListingOrder(userId, listingId);

        ArgumentCaptor<List<OrderStatus>> statusesCaptor = ArgumentCaptor.forClass(List.class);
        verify(orderRepository).hasPurchasedListing(
                org.mockito.ArgumentMatchers.eq(userId),
                org.mockito.ArgumentMatchers.eq(listingId),
                statusesCaptor.capture()
        );
        assertThat(eligible).isTrue();
        assertThat(statusesCaptor.getValue()).containsExactly(OrderStatus.COMPLETED);
    }

    @Test
    void publicPurchasedCheckAlsoUsesCompletedOrdersOnly() {
        UUID userId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();
        when(orderRepository.hasPurchasedListing(userId, listingId, List.of(OrderStatus.COMPLETED)))
                .thenReturn(true);
        OrderService service = new OrderService(
                orderRepository,
                cartRepository,
                inventoryClient,
                catalogClient,
                orderMapper
        );

        boolean purchased = service.hasPurchasedListing(userId, listingId);

        ArgumentCaptor<List<OrderStatus>> statusesCaptor = ArgumentCaptor.forClass(List.class);
        verify(orderRepository).hasPurchasedListing(
                org.mockito.ArgumentMatchers.eq(userId),
                org.mockito.ArgumentMatchers.eq(listingId),
                statusesCaptor.capture()
        );
        assertThat(purchased).isTrue();
        assertThat(statusesCaptor.getValue()).containsExactly(OrderStatus.COMPLETED);
    }
}
