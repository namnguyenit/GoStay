export const endpoint = {
  experience: {
    getAll: "/v1/catalog/listings?category=EXP",
    getById: (id: string) => `/v1/catalog/listings/${id}`,
  },
  place: {
    getAll: "/v1/catalog/listings?category=STAY",
    getLandmarks: "/v1/catalog/listings/landmarks",
    getNearbyListings: "/v1/catalog/listings/landmarks/{id}/nearby",
  },
  service: {
    getAll: "/v1/catalog/listings?category=SVC",
  },
};
