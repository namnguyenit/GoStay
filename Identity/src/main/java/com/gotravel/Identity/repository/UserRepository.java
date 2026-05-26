package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User , String> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
    Page<User> findAllByIsDeleted(boolean isDeleted, Pageable pageable);
    Page<User> findAllByIsActive(boolean isActive, Pageable pageable);
    Page<User> findAll(Pageable pageable);
    Page<User> findAllByRoles_Name(String roleName,Pageable pageable);
}
