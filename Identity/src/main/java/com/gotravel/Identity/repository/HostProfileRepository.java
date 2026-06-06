package com.gotravel.Identity.repository;

import com.gotravel.Identity.entity.HostProfile;
import com.gotravel.Identity.enums.Approval_status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostProfileRepository extends JpaRepository<HostProfile, String> {
    List<HostProfile> findByApprovalStatus(Approval_status approvalStatus);
    Page<HostProfile> findAllByApprovalStatus(Approval_status approvalStatus, Pageable pageable);
    long countByApprovalStatus(Approval_status approvalStatus);
}
