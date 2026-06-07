package com.gotravel.Identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountRequest {
    @NotBlank(message = "Tên ngân hàng không được để trống")
    String bankName;

    @NotBlank(message = "Số tài khoản không được để trống")
    String bankAccount;

    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    String bankAccountName;
}
