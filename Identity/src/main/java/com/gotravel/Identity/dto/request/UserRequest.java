package com.gotravel.Identity.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserRequest {
    String username;
    String password;
    
    @NotBlank(message = "Email is missing or empty")
    @Email(message = "Email must be properly formatted")
    String email;
    
    String fullName;
    String phoneNumber;
}
