import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllServicesResponseDtoSchema } from "@/dto/responses/service";
import { mapService } from "@/modules/service";

const ServiceServices = {
  getAll: async () => {
    // Call API
    const res = await Api.get(endpoint.service.getAll);
    // Parse DTO
    const parsed = getAllServicesResponseDtoSchema.safeParse(res);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapService(parsed.data);

    return mapper;
  },
};

export default ServiceServices;
