package com.gotravel.Identity.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostProfileRequest {
    String cccdNumber;
    String bankAccount;
    String bankName;
}
