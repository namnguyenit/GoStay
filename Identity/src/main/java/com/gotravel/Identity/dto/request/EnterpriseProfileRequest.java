package com.gotravel.Identity.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnterpriseProfileRequest {
    String companyName;
    String taxCode;
    String companyAddress;
    String representativeName;
}
