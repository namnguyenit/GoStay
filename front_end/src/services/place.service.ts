import { API, parseApiResponse } from "@/shared";
import { PlacesSchema } from "@/features/place";
import { endpoint } from "@/config";

const PlaceService = {
  getAll: async () => {
    const res = await API.get(endpoint.place.getAll);
    const parsed = parseApiResponse(res, PlacesSchema);
    return parsed;
  },
};

export default PlaceService;
