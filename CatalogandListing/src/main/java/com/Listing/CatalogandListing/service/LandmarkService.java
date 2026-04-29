package com.Listing.CatalogandListing.service;


import com.Listing.CatalogandListing.dto.request.landmark.SuggestLandmarkRequest;
import com.Listing.CatalogandListing.dto.response.ApiResponse;
import org.springframework.stereotype.Service;

@Service
public class LandmarkService {


    public boolean suggestLandmark(String id , SuggestLandmarkRequest suggestLandmarkRequest){
        return true;

    }
}
