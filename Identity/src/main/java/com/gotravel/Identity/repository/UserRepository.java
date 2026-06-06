package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    long countByIsActive(boolean isActive);
    long countByIsDeleted(boolean isDeleted);

    @Query("""
            select count(distinct user)
            from User user
            join user.roles role
            where role.name = :roleName
            """)
    long countByRoleName(@Param("roleName") String roleName);

    @Query("""
            select distinct user
            from User user
            left join user.userProfile profile
            join user.roles role
            where role.name = :roleName
              and (
                :keyword is null
                or :keyword = ''
                or lower(user.username) like lower(concat('%', :keyword, '%'))
                or lower(user.email) like lower(concat('%', :keyword, '%'))
                or lower(profile.fullName) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<User> searchByRoleNameAndKeyword(@Param("roleName") String roleName,
                                          @Param("keyword") String keyword,
                                          Pageable pageable);
}
