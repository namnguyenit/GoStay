package com.gotravel.Identity.mapper;

import com.gotravel.Identity.dto.request.UserRequest;
import com.gotravel.Identity.dto.response.UserReponse;
import org.mapstruct.Mapper;
import com.gotravel.Identity.entity.User;
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserReponse UserRequestToUserReponse(UserRequest userRequest);
    User UserRequestToUser(UserRequest userRequest);
}
