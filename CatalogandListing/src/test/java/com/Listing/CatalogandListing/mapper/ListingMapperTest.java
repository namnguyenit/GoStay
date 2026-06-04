package com.Listing.CatalogandListing.mapper;

import com.Listing.CatalogandListing.dto.response.ListingDetailResponse;
import com.Listing.CatalogandListing.entity.Complex;
import com.Listing.CatalogandListing.entity.Listing;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ListingMapperTest {
    private final ListingMapper mapper = Mappers.getMapper(ListingMapper.class);

    @Test
    void toDetailResponseMapsComplexId() {
        UUID complexId = UUID.randomUUID();
        Listing listing = Listing.builder()
                .complex(Complex.builder().id(complexId).build())
                .build();

        ListingDetailResponse response = mapper.toDetailResponse(listing);

        assertThat(response.getComplexId()).isEqualTo(complexId);
    }

    @Test
    void toDetailResponseAllowsListingWithoutComplex() {
        Listing listing = Listing.builder().build();

        ListingDetailResponse response = mapper.toDetailResponse(listing);

        assertThat(response.getComplexId()).isNull();
    }
}
