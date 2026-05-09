package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
import com.Listing.CatalogandListing.dto.request.complex.UpdateProfileEnterpiseRequest;
import com.Listing.CatalogandListing.entity.Complex;
import com.Listing.CatalogandListing.enums.ComplexStatus;
import com.Listing.CatalogandListing.exception.AppException;
import com.Listing.CatalogandListing.exception.ComplexErrorCode;
import com.Listing.CatalogandListing.mapper.ComplexMapper;
import com.Listing.CatalogandListing.repository.ComplexRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ComplexService {

    ComplexMapper complexMapper;
    ComplexRepository complexRepository;

    @Transactional
    public void createComplex(String userId, CreateComplexRequest request) {
        Complex complex = complexMapper.toEntity(request);
        complex.setHostId(UUID.fromString(userId));
        complex.setStatus(ComplexStatus.ACTIVE);
        complexRepository.save(complex);
    }


    @Transactional
    public void updateComplex(String complexId, String userId, UpdateProfileEnterpiseRequest request) {
        Complex complex = complexRepository.findById(UUID.fromString(complexId))
                .orElseThrow(() -> new AppException(ComplexErrorCode.COMPLEX_NOT_FOUND));

        if (!complex.getHostId().equals(UUID.fromString(userId))) {
            throw new AppException(ComplexErrorCode.COMPLEX_ACCESS_DENIED);
        }

        complexMapper.updateEntityFromRequest(request, complex);
        complexRepository.save(complex);
    }

    @Transactional
    public void deleteComplex(String complexId, String userId) {
        Complex complex = complexRepository.findById(UUID.fromString(complexId))
                .orElseThrow(() -> new AppException(ComplexErrorCode.COMPLEX_NOT_FOUND));

        if (!complex.getHostId().equals(UUID.fromString(userId))) {
            throw new AppException(ComplexErrorCode.COMPLEX_ACCESS_DENIED);
        }

        complex.setStatus(ComplexStatus.HIDDEN);
        complexRepository.save(complex);
    }
}
