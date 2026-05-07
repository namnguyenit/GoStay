package com.gotravel.Identity.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiRequest <T>{
    @Builder.Default
    boolean success = true;
    @Builder.Default
    int status = 200;
    String code;
    String message;
    T data;
}
