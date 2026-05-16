package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.EnterpriseProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnterpriseProfileRepository extends JpaRepository<EnterpriseProfile, String> {
}
