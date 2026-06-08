package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.Listing.CatalogandListing.dto.response.ComplexResponse;
import com.Listing.CatalogandListing.util.GeometryUtil;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ComplexService {

    ComplexMapper complexMapper;
    ComplexRepository complexRepository;

    public void createComplex(String userId, CreateComplexRequest request) {
        Complex complex = complexMapper.toEntity(request);
        complex.setHostId(UUID.fromString(userId));
        complex.setStatus(ComplexStatus.ACTIVE);
        complex.setLocation(GeometryUtil.createPoint(complex.getLongitude(), complex.getLatitude()));
        complexRepository.save(complex);
    }

    public List<ComplexResponse> getComplexesByHostId(String userId) {
        return complexRepository.findByHostId(UUID.fromString(userId))
                .stream()
                .map(complexMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ComplexResponse getComplexById(String userId, UUID complexId) {
        Complex complex = getOwnedComplex(userId, complexId);
        return complexMapper.toResponse(complex);
    }

    public void updateComplex(String userId, UUID complexId, CreateComplexRequest request) {
        Complex complex = getOwnedComplex(userId, complexId);
        complexMapper.updateEntityFromRequest(request, complex);
        complex.setLocation(GeometryUtil.createPoint(complex.getLongitude(), complex.getLatitude()));
        complexRepository.save(complex);
    }

    public void hideComplex(String userId, UUID complexId) {
        Complex complex = getOwnedComplex(userId, complexId);
        complex.setStatus(ComplexStatus.HIDDEN);
        complexRepository.save(complex);
    }

    private Complex getOwnedComplex(String userId, UUID complexId) {
        Complex complex = complexRepository.findById(complexId)
                .orElseThrow(() -> new AppException(ComplexErrorCode.COMPLEX_NOT_FOUND));
        if (!complex.getHostId().equals(UUID.fromString(userId))) {
            throw new AppException(ComplexErrorCode.COMPLEX_ACCESS_DENIED);
        }
        return complex;
    }
}
