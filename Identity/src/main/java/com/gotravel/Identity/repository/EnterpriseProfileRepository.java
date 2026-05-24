package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.EnterpriseProfile;
import com.gotravel.Identity.enums.Approval_status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnterpriseProfileRepository extends JpaRepository<EnterpriseProfile, String> {
    List<EnterpriseProfile> findByApprovalStatus(Approval_status approvalStatus);
    Page<EnterpriseProfile> findAllByApprovalStatus(Approval_status approvalStatus, Pageable pageable);
}
