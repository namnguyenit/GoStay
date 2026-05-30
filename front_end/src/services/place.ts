import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllPlacesResponseDtoSchema } from "@/dto/responses/place/get-all-places";
import { mapPlaces } from "@/modules/place/mappers/map-places";

const PlaceServices = {
  getAll: async () => {
    const res = await Api.get(endpoint.place.getAll);
    // Parse DTO
    let adaptedRes = res;
    if (res && res.data && res.data.content && Array.isArray(res.data.content)) {
      adaptedRes = {
        ...res,
        data: res.data.content.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.basePrice ? Number(item.basePrice) : undefined,
          rating: item.averageRating ? Number(item.averageRating) : undefined,
          img: item.thumbnailUrl,
          address: item.province,
        }))
      };
    }
    const parsed = getAllPlacesResponseDtoSchema.safeParse(adaptedRes);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapPlaces(parsed.data);

    // console.log(mapper);
    return mapper;
  },
  
  getById: async (id: string) => {
    try {
      const res = await Api.get(`/v1/catalog/listings/${id}`);
      return res?.data ?? null;
    } catch (err) {
      console.error(`Failed to fetch listing ${id}:`, err);
      return null;
    }
  },

  getNearbyListings: async (landmarkId: string, radiusMeters: number = 5000) => {
    try {
      const res = await Api.get(endpoint.place.getNearbyListings.replace('{id}', landmarkId) + '?radius=' + radiusMeters);
      return res?.data ?? { STAY: [], EXPERIENCE: [], SVC: [] };
    } catch (err) {
      console.error("Failed to fetch nearby listings:", err);
      return { STAY: [], EXPERIENCE: [], SVC: [] };
    }
  },
  getLandmarks: async () => {
    try {
      const res = await Api.get(endpoint.place.getLandmarks);
      return res?.data ?? [];
    } catch (err) {
      console.error("Failed to fetch landmarks:", err);
      return [];
    }
  }
};

export default PlaceServices;
