package com.GoTravel.CartandOrder.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    @NotNull(message = "Listing ID không được để trống")
    private UUID listingId;
    
    @NotNull(message = "Tên dịch vụ không được để trống")
    private String listingTitle;
    
    private String thumbnailUrl;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;
    
    private String timeSlot;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    
    @NotNull(message = "Giá đơn vị không được để trống")
    private BigDecimal unitPrice;
}
