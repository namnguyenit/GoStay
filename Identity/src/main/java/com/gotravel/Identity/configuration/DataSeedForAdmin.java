package com.gotravel.Identity.configuration;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gotravel.Identity.entity.Role;
import com.gotravel.Identity.entity.User;
import com.gotravel.Identity.repository.RoleRepository;
import com.gotravel.Identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeedForAdmin {
    final UserRepository userRepository;
    final RoleRepository roleRepository;
    final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner createDataSeedAdmin(){
        return args -> {
            Role adminRole = roleRepository.findById("ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build()));

            User userAdmin = userRepository.findByUsername("admin").orElseGet(() -> User.builder().username("admin").build());
            userAdmin.setPassword(passwordEncoder.encode("12345678"));
            userAdmin.setEmail("dm@admin");
            userAdmin.setRoles(Set.of(adminRole));
            userRepository.save(userAdmin);
            log.info("create admin");
        };
    }
}