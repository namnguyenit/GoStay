package com.gotravel.Identity.service;


import com.gotravel.Identity.dto.request.UserRequest;
import com.gotravel.Identity.dto.response.UserReponse;
import com.gotravel.Identity.mapper.UserMapper;
import com.gotravel.Identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import com.gotravel.Identity.entity.User;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE )
@RequiredArgsConstructor
public class UserService {
    final UserRepository userRepository;
    final UserMapper userMapper;
    public UserReponse createUser(UserRequest userRequest){
        if(userRepository.existsById(userRequest.getUsername())){
            throw new RuntimeException("nguoi dung da co");
        }
        User user = userMapper.UserRequestToUser(userRequest);
        userRepository.save(user);
        return userMapper.UserRequestToUserReponse(userRequest);
    }

}
