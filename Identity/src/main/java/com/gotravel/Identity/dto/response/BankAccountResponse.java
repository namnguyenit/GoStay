package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountResponse {
    String ownerType;
    String approvalStatus;
    String bankName;
    String bankAccount;
    String bankAccountName;
}
