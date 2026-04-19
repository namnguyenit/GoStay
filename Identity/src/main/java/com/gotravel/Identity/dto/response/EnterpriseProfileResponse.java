package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnterpriseProfileResponse {
    String companyName;
    String taxCode;
    String companyAddress;
    String representativeName;
}
