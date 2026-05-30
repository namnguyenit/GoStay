const fs = require('fs');
const path = '/Users/nhannt/Desktop/desktop/project/GoStay/CatalogandListing/src/main/java/com/Listing/CatalogandListing/controller/CatalogPublicController.java';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('import java.util.Map;')) {
  content = content.replace('import java.util.UUID;', 'import java.util.UUID;\nimport java.util.Map;\nimport com.Listing.CatalogandListing.entity.Listing;');
}

if (!content.includes('public ResponseEntity<ApiResponse<Map<String, List<Listing>>>> getNearbyListings')) {
  const newEndpoint = `
    @GetMapping("/landmarks/{landmarkId}/nearby")
    public ResponseEntity<ApiResponse<Map<String, List<Listing>>>> getNearbyListings(
            @PathVariable UUID landmarkId,
            @RequestParam(defaultValue = "5000") double radius) {
        Map<String, List<Listing>> nearby = landmarkService.getNearbyListings(landmarkId, radius);
        return ResponseEntity.ok(ApiResponse.<Map<String, List<Listing>>>builder()
                .code(com.Listing.CatalogandListing.exception.SuccessCode.SUCCESS.getCode())
                .message("Success")
                .data(nearby)
                .build());
    }
`;
  content = content.replace('public ResponseEntity<ApiResponse<List<Landmark>>> getPublicLandmarks() {', newEndpoint + '\n    @GetMapping("/landmarks")\n    public ResponseEntity<ApiResponse<List<Landmark>>> getPublicLandmarks() {');
}

fs.writeFileSync(path, content);
console.log("CatalogPublicController updated");
