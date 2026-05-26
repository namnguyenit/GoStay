import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllPlacesResponseDtoSchema } from "@/dto/responses/place/get-all-places";
import { mapPlaces } from "@/modules/place/mappers/map-places";

const PlaceServices = {
  getAll: async () => {
    // Call API
    const res = await Api.get(endpoint.place.getAll);
    // Parse DTO
    const parsed = getAllPlacesResponseDtoSchema.safeParse(res);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapPlaces(parsed.data);

    // console.log(mapper);
    return mapper;
  },
};

export default PlaceServices;
