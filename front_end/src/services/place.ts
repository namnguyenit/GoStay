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
