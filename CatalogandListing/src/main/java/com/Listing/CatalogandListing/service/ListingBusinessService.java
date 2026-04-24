package com.Listing.CatalogandListing.service;

import com.Listing.CatalogandListing.dto.request.ListingRequest;
import com.Listing.CatalogandListing.dto.request.ListingServiceRequest;
import com.Listing.CatalogandListing.dto.response.ListingResponse;
import com.Listing.CatalogandListing.entity.Coordinate;
import com.Listing.CatalogandListing.entity.Listing;
import com.Listing.CatalogandListing.entity.ListingService;
import com.Listing.CatalogandListing.entity.Location;
import com.Listing.CatalogandListing.mapper.ListingMapper;
import com.Listing.CatalogandListing.repository.ListingRepository;
import com.Listing.CatalogandListing.repository.ListingServiceRepository;
import com.Listing.CatalogandListing.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingBusinessService {

    private final ListingRepository listingRepository;
    private final LocationRepository locationRepository;
    private final ListingServiceRepository listingServiceRepository;
    private final ListingMapper listingMapper;

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private List<String> getCurrentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    public ListingResponse createListing(ListingRequest request) {
        String username = getCurrentUsername();

        Location location = locationRepository.findByProvinceName(request.getProvinceName())
                .orElseGet(() -> {
                    Location newLoc = Location.builder().provinceName(request.getProvinceName()).build();
                    return locationRepository.save(newLoc);
                });

        Listing listing = Listing.builder()
                .name(request.getName())
                .ownerUsername(username)
                .coordinate(Coordinate.builder()
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .build())
                .location(location)
                .services(new ArrayList<>())
                .build();

        return listingMapper.toResponse(listingRepository.save(listing));
    }

    public void addServiceToListing(ListingServiceRequest request) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cơ sở nhà hàng"));

        if (!listing.getOwnerUsername().equals(getCurrentUsername())) {
            throw new RuntimeException("Bạn không phải chủ sở hữu của cơ sở này.");
        }

        List<String> roles = getCurrentRoles();
        boolean isHost = roles.contains("ROLE_HOST");
        boolean isEnterprise = roles.contains("ROLE_ENTERPRISE");

        if (isHost && !isEnterprise) {
            long existingServiceCount = listingServiceRepository.countByListingId(listing.getId());
            if (existingServiceCount >= 1) {
                throw new RuntimeException(
                        "Tài khoản ROLE_HOST chỉ được phép có tối đa 1 dịch vụ (Nhà hàng). Vui lòng nâng cấp Enterprise để thêm nhiều dịch vụ (Vinpearl)!");
            }
        }

        ListingService newService = ListingService.builder()
                .serviceName(request.getServiceName())
                .price(request.getPrice())
                .listing(listing)
                .build();

        listingServiceRepository.save(newService);
    }

    public List<ListingResponse> getMyListings() {
        String baseUser = getCurrentUsername();
        return listingRepository.findByOwnerUsername(baseUser).stream()
                .map(listingMapper::toResponse)
                .collect(Collectors.toList());
    }
}
