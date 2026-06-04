package com.Listing.CatalogandListing.controller;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import static org.assertj.core.api.Assertions.assertThat;

class CatalogControllerAuthorizationTest {

    @Test
    void hostControllerRequiresHostOrEnterpriseRole() {
        PreAuthorize annotation = CatalogHostController.class.getAnnotation(PreAuthorize.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo("hasAnyRole('HOST', 'ENTERPRISE')");
    }

    @Test
    void enterpriseComplexEndpointsRequireEnterpriseRole() throws NoSuchMethodException {
        PreAuthorize createComplex = CatalogHostController.class
                .getMethod("createComplex", com.Listing.CatalogandListing.dto.request.complex.CreateComplexRequest.class)
                .getAnnotation(PreAuthorize.class);
        PreAuthorize getMyComplexes = CatalogHostController.class
                .getMethod("getMyComplexes")
                .getAnnotation(PreAuthorize.class);

        assertThat(createComplex).isNotNull();
        assertThat(createComplex.value()).isEqualTo("hasRole('ENTERPRISE')");
        assertThat(getMyComplexes).isNotNull();
        assertThat(getMyComplexes.value()).isEqualTo("hasRole('ENTERPRISE')");
    }

    @Test
    void adminControllerRequiresAdminRole() {
        PreAuthorize annotation = CatalogAdminController.class.getAnnotation(PreAuthorize.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo("hasRole('ADMIN')");
    }
}
