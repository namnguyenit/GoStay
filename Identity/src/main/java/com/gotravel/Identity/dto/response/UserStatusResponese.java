package com.gotravel.Identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)



public class UserStatusResponese {
    Boolean isActive;
    Boolean isDeleted;
    Boolean isAllowed;
}
