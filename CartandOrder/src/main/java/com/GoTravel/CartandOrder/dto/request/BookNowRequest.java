package com.GoTravel.CartandOrder.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    @Valid
    private CartItemRequest item;
    
    @NotBlank(message = "Họ tên khách hàng không được để trống")
    private String fullName;

    @NotBlank(message = "Email khách hàng không được để trống")
    @Email(message = "Email khách hàng không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại khách hàng không được để trống")
    private String phone;
}
