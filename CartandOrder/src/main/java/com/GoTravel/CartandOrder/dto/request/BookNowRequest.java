package com.GoTravel.CartandOrder.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookNowRequest {
    @NotNull(message = "Thông tin item không được để trống")
    private CartItemRequest item;
    
    private String fullName;
    private String email;
    private String phone;
}
