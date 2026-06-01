package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
import com.Listing.CatalogandListing.entity.Complex;
import com.Listing.CatalogandListing.enums.ComplexStatus;
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
        complexRepository.save(complex);
    }

    public List<ComplexResponse> getComplexesByHostId(String userId) {
        return complexRepository.findByHostId(UUID.fromString(userId))
                .stream()
                .map(complexMapper::toResponse)
                .collect(Collectors.toList());
    }
}
