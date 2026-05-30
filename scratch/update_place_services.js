const fs = require('fs');

// 1. Update endpoint
const endpointPath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/config/endpoint.ts';
let endpointContent = fs.readFileSync(endpointPath, 'utf-8');
if (!endpointContent.includes('getNearbyListings:')) {
  endpointContent = endpointContent.replace(
    'getLandmarks: "/v1/catalog/listings/landmarks",',
    'getLandmarks: "/v1/catalog/listings/landmarks",\n    getNearbyListings: "/v1/catalog/listings/landmarks/{id}/nearby",'
  );
  fs.writeFileSync(endpointPath, endpointContent);
}

// 2. Update service
const servicePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/services/place.ts';
let serviceContent = fs.readFileSync(servicePath, 'utf-8');
if (!serviceContent.includes('getNearbyListings:')) {
  const methodCode = `
  getNearbyListings: async (landmarkId: string, radiusMeters: number = 5000) => {
    try {
      const res = await Api.get(endpoint.place.getNearbyListings.replace('{id}', landmarkId) + '?radius=' + radiusMeters);
      return res?.data ?? { STAY: [], EXPERIENCE: [], SVC: [] };
    } catch (err) {
      console.error("Failed to fetch nearby listings:", err);
      return { STAY: [], EXPERIENCE: [], SVC: [] };
    }
  },`;
  serviceContent = serviceContent.replace('getLandmarks: async () => {', methodCode + '\n  getLandmarks: async () => {');
  fs.writeFileSync(servicePath, serviceContent);
}
