package com.gotravel.PaymentandWallet.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCommissionConfigRequest {
    @NotNull(message = "Tỷ lệ hoa hồng không được để trống")
    @DecimalMin(value = "0.0000", message = "Tỷ lệ hoa hồng không được âm")
    @DecimalMax(value = "0.5000", message = "Tỷ lệ hoa hồng không được vượt quá 50%")
    private BigDecimal rate;

    private String reason;
}
