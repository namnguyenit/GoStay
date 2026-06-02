package com.GoTravel.CartandOrder.dto.request;

import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.GoTravel.CartandOrder.entity.Order;

@Data
public class CheckoutCartRequest {
    @NotNull(message = "Danh sách itemIds không được để trống")
    @NotEmpty(message = "Phải chọn ít nhất 1 dịch vụ để thanh toán")
    private List<UUID> itemIds;

    @NotNull(message = "Thông tin khách hàng không được để trống")
    private Order.CustomerInfo customerInfo;
}
