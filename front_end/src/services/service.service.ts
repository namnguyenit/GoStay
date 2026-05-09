import { Api } from "@/shared/api";
import { parseApiResponse } from "@/shared/parsers";
import { ServicesSchema } from "@/features/service/model/schema";
import { endpoint } from "@/config";

const ServiceService = {
  getAll: async () => {
    const res = await Api.get(endpoint.service.getAll);
    const parsed = parseApiResponse(res, ServicesSchema);
    return parsed;
  },
};

export default ServiceService;
