import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllPlacesResponseDtoSchema } from "@/dto/responses/place/get-all-places";
import { mapPlaces } from "@/modules/place/mappers/map-places";

type RawListing = {
  id?: string;
  title?: string;
  basePrice?: string | number;
  averageRating?: string | number;
  thumbnailUrl?: string;
  province?: string;
  category?: string;
};

const PlaceServices = {
  getAll: async () => {
    const res = await Api.get(endpoint.place.getAll);
    // Parse DTO
    let adaptedRes = res;
    let items = res?.data?.content || res?.data?.data;
    if (Array.isArray(res?.data)) {
      items = res.data;
    }
    
    if (items && Array.isArray(items)) {
      adaptedRes = {
        ...res,
        data: (items as RawListing[]).map((item) => ({
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
      const data = res?.data ?? res;

      if (Array.isArray(data)) {
        return {
          STAY: (data as RawListing[]).filter((item) => item?.category === "STAY"),
          EXP: (data as RawListing[]).filter((item) => item?.category === "EXP"),
          SVC: (data as RawListing[]).filter((item) => item?.category === "SVC"),
          COMPLEX: [],
        };
      }

      return {
        STAY: data?.STAY ?? [],
        EXP: data?.EXP ?? [],
        SVC: data?.SVC ?? [],
        COMPLEX: data?.COMPLEX ?? [],
      };
    } catch (err) {
      console.error("Failed to fetch nearby listings:", err);
      return { STAY: [], EXP: [], SVC: [], COMPLEX: [] };
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
