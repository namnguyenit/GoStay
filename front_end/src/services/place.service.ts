import { Api } from "@/shared/api";
import { parseApiResponse } from "@/shared/parsers";
import { PlacesSchema } from "@/features/place";
import { endpoint } from "@/config";

const PlaceService = {
  getAll: async () => {
    const res = await Api.get(endpoint.place.getAll);
    const parsed = parseApiResponse(res, PlacesSchema);
    return parsed;
  },
};

export default PlaceService;
