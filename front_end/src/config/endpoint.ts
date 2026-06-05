export const endpoint = {
  experience: {
    getAll: "/v1/search/listings?category=EXP&limit=500",
    getById: (id: string) => `/v1/catalog/listings/${id}`,
  },
  place: {
    getAll: "/v1/search/listings?category=STAY&limit=500",
    getLandmarks: "/v1/catalog/listings/landmarks",
    getNearbyListings: "/v1/recommendations/landmarks/{id}",
  },
  service: {
    getAll: "/v1/search/listings?category=SVC&limit=500",
  },
};
