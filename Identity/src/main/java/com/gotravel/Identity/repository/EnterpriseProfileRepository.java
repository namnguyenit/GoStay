package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.EnterpriseProfile;
import com.gotravel.Identity.enums.Approval_status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnterpriseProfileRepository extends JpaRepository<EnterpriseProfile, String> {
    Page<EnterpriseProfile> findAllByApprovalStatus(Approval_status approvalStatus, Pageable pageable);
    long countByApprovalStatus(Approval_status approvalStatus);
}
