package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.HostProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostProfileRepository extends JpaRepository<HostProfile, String> {
    List<HostProfile> findByApprovalStatus(com.gotravel.Identity.enums.Approval_status approvalStatus);
    Page<HostProfile> findAllByApprovalStatus(com.gotravel.Identity.enums.Approval_status approvalStatus, Pageable pageable);
    long countByApprovalStatus(com.gotravel.Identity.enums.Approval_status approvalStatus);
}
