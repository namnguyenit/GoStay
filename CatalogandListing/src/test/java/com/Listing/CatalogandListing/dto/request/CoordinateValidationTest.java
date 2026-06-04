package com.Listing.CatalogandListing.dto.request;

import com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest;
import com.Listing.CatalogandListing.dto.request.landmark.SaveLandmarkRequest;
import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.dto.request.listing.SaveListingRequest;
import com.Listing.CatalogandListing.entity.attributes.ExpAttributes;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CoordinateValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void listingCoordinatesMustBeInsideWgs84Range() {
        SaveListingRequest request = new SaveListingRequest();

        request.setLatitude(90.0);
        request.setLongitude(-180.0);
        assertValid(request, "latitude");
        assertValid(request, "longitude");

        request.setLatitude(90.000001);
        request.setLongitude(-180.000001);
        assertInvalid(request, "latitude");
        assertInvalid(request, "longitude");
    }

    @Test
    void landmarkCoordinatesMustBeInsideWgs84Range() {
        SaveLandmarkRequest request = new SaveLandmarkRequest();

        request.setLatitude(-90.0);
        request.setLongitude(180.0);
        assertValid(request, "latitude");
        assertValid(request, "longitude");

        request.setLatitude(-90.000001);
        request.setLongitude(180.000001);
        assertInvalid(request, "latitude");
        assertInvalid(request, "longitude");
    }

    @Test
    void landmarkSuggestionCoordinatesMustBeInsideWgs84Range() {
        SuggestLandmarkRequest request = new SuggestLandmarkRequest();

        request.setSuggestedLatitude(0.0);
        request.setSuggestedLongitude(0.0);
        assertValid(request, "suggestedLatitude");
        assertValid(request, "suggestedLongitude");

        request.setSuggestedLatitude(91.0);
        request.setSuggestedLongitude(181.0);
        assertInvalid(request, "suggestedLatitude");
        assertInvalid(request, "suggestedLongitude");
    }

    @Test
    void complexCoordinatesMustBeInsideWgs84Range() {
        CreateComplexRequest request = new CreateComplexRequest();

        request.setLatitude(10.0);
        request.setLongitude(106.0);
        assertValid(request, "latitude");
        assertValid(request, "longitude");

        request.setLatitude(-91.0);
        request.setLongitude(-181.0);
        assertInvalid(request, "latitude");
        assertInvalid(request, "longitude");
    }

    @Test
    void experienceMeetingPointCoordinatesMustBeInsideWgs84Range() {
        ExpAttributes.ExpDetail detail = new ExpAttributes.ExpDetail();

        detail.setMeetingPointLat(21.0);
        detail.setMeetingPointLng(105.0);
        assertValid(detail, "meetingPointLat");
        assertValid(detail, "meetingPointLng");

        detail.setMeetingPointLat(91.0);
        detail.setMeetingPointLng(181.0);
        assertInvalid(detail, "meetingPointLat");
        assertInvalid(detail, "meetingPointLng");
    }

    private void assertValid(Object target, String property) {
        assertThat(validator.validateProperty(target, property)).isEmpty();
    }

    private void assertInvalid(Object target, String property) {
        assertThat(validator.validateProperty(target, property)).isNotEmpty();
    }
}
