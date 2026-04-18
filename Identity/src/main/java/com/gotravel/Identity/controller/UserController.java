package com.gotravel.Identity.controller;
import com.gotravel.Identity.dto.request.ApiRequest;
import com.gotravel.Identity.dto.request.UserRequest;
import com.gotravel.Identity.dto.response.UserReponse;
import com.gotravel.Identity.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;


    @PostMapping
    public ApiRequest<UserReponse> createUser(@RequestBody @Valid UserRequest user){
        return ApiRequest.<UserReponse>builder()
                .success(true)
                .data(userService.createUser(user))
                .messeger("tao thanh cong")
                .build();
    }


}
