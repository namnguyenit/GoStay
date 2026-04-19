package com.gotravel.Identity.service;


import com.gotravel.Identity.dto.request.UserRequest;
import com.gotravel.Identity.dto.response.UserReponse;
import com.gotravel.Identity.mapper.UserMapper;
import com.gotravel.Identity.repository.RoleRepository;
import com.gotravel.Identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import com.gotravel.Identity.entity.User;
import com.gotravel.Identity.entity.Role;
import com.gotravel.Identity.entity.UserProfile;
import com.gotravel.Identity.entity.HostProfile;
import com.gotravel.Identity.entity.EnterpriseProfile;
import com.gotravel.Identity.enums.Provider;

import java.util.List;
import java.util.Set;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE )
@RequiredArgsConstructor
public class UserService {
    final UserRepository userRepository;
    final UserMapper userMapper;
    final RoleRepository roleRepository;
    public UserReponse createUser(UserRequest userRequest){
        if(userRepository.existsByUsername(userRequest.getUsername())){
            throw new RuntimeException("nguoi dung da co");
        }
        User user = userMapper.UserRequestToUser(userRequest);
        
        Role userRole = roleRepository.findById("USER").orElseThrow(() -> new RuntimeException("Role USER not found"));
        user.setRoles(Set.of(userRole));
        
        // Define default provider as LOCAL if not set
        user.setProvider(Provider.LOCAL);
        user.setIsActive(true);
        
        // Create an associated UserProfile
        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .fullName(userRequest.getFullName())
                .phoneNumber(userRequest.getPhoneNumber())
                .build();
                
        user.setUserProfile(userProfile);
        
        userRepository.save(user);
        
        UserReponse response = userMapper.UserRequestToUserReponse(userRequest);
        response.setEmail(user.getEmail());
        return response;
    }

    public List<UserReponse> getAllUser(){
        List<User> userList = userRepository.findAll();
        return userList.stream().map(user -> userMapper.UserToUserReponse(user)).toList();
    }

//    public UserReponse modifyUser(){
//
//    }

    public void deleteUser(UserRequest userRequest){
        User user = userRepository.findByUsername(userRequest.getUsername()).orElseThrow(() -> new RuntimeException("sai"));
        userRepository.delete(user);
    }

    public void upgradeToRole(String username, String roleName) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findById(roleName.toUpperCase()).orElseThrow(() -> new RuntimeException("Role not found"));
        
        user.getRoles().add(role);
        
        if (roleName.equalsIgnoreCase("HOST") && user.getHostProfile() == null) {
            HostProfile hostProfile = HostProfile.builder()
                .user(user)
                .build();
            user.setHostProfile(hostProfile);
        } else if (roleName.equalsIgnoreCase("ENTERPRISE") && user.getEnterpriseProfile() == null) {
            EnterpriseProfile enterpriseProfile = EnterpriseProfile.builder()
                .user(user)
                .build();
            user.setEnterpriseProfile(enterpriseProfile);
        }
        
        userRepository.save(user);
    }

}
