const fs = require('fs');
const path = '/Users/nhannt/Desktop/desktop/project/GoStay/CatalogandListing/src/main/java/com/Listing/CatalogandListing/service/LandmarkService.java';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('import java.util.Map;')) {
  content = content.replace('import java.util.UUID;', 'import java.util.UUID;\nimport java.util.Map;\nimport java.util.HashMap;\nimport java.util.stream.Collectors;');
}

if (!content.includes('import com.Listing.CatalogandListing.repository.ListingRepository;')) {
  content = content.replace('import com.Listing.CatalogandListing.repository.LandmarkSuggestionRepository;', 'import com.Listing.CatalogandListing.repository.LandmarkSuggestionRepository;\nimport com.Listing.CatalogandListing.repository.ListingRepository;\nimport com.Listing.CatalogandListing.entity.Listing;');
}

if (!content.includes('final ListingRepository listingRepository;')) {
  content = content.replace('final LandmarkRepository landmarkRepository;', 'final LandmarkRepository landmarkRepository;\n    final ListingRepository listingRepository;');
}

if (!content.includes('public Map<String, List<Listing>> getNearbyListings')) {
  content = content.replace('public java.util.List<Landmark> getPublicLandmarks() {', `
     public Map<String, java.util.List<Listing>> getNearbyListings(UUID landmarkId, double radiusMeters) {
         Landmark landmark = landmarkRepository.findById(landmarkId)
                 .orElseThrow(() -> new com.Listing.CatalogandListing.exception.AppException(
                         com.Listing.CatalogandListing.exception.LandmarkErrorCode.LANDMARK_NOT_FOUND));

         if (landmark.getLatitude() == null || landmark.getLongitude() == null) {
             return new HashMap<>();
         }

         java.util.List<Listing> nearbyListings = listingRepository.findActiveListingsWithinRadius(
                 landmark.getLongitude(), landmark.getLatitude(), radiusMeters);

         return nearbyListings.stream().collect(Collectors.groupingBy(l -> l.getCategory().name()));
     }

     public java.util.List<Landmark> getPublicLandmarks() {`);
}

fs.writeFileSync(path, content);
console.log("LandmarkService updated");
