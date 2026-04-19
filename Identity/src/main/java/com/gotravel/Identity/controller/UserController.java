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
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ApiRequest<List<UserReponse>> getAllUser(){
        return ApiRequest.<List<UserReponse>>builder()
                .success(true)
                .data(userService.getAllUser())
                .build();
    }

//    @Modifying
//    public ApiRequest<UserReponse> modifyUser(@RequestBody @Valid UserRequest user){
//
//    }

    @DeleteMapping
    public ApiRequest deleteUser(@RequestBody @Valid UserRequest user){
        userService.deleteUser(user);
        return ApiRequest.builder()
                .success(true)
                .messeger("xao thanh cong")
                .build();
    }




}
