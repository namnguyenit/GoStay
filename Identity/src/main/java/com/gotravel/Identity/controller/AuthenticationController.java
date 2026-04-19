package com.gotravel.Identity.controller;

import com.gotravel.Identity.dto.request.ApiRequest;
import com.gotravel.Identity.dto.request.AuthenticationRequest;
import com.gotravel.Identity.dto.response.AuthenticationResponse;
import com.gotravel.Identity.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiRequest<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiRequest.<AuthenticationResponse>builder()
                .success(true)
                .data(result)
                .message("Authenticated successfully")
                .build();
    }
}
