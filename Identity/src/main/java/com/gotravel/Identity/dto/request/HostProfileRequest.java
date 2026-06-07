package com.gotravel.Identity.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostProfileRequest {
    String fullName;
    String phone;
    String cccdNumber;
    String taxCode;
    String idCard;
    String bankAccount;
    String bankName;
    String bankAccountName;
}
