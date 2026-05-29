import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllServicesResponseDtoSchema } from "@/dto/responses/service";
import { mapService } from "@/modules/service";

const ServiceServices = {
  getAll: async () => {
    const res = await Api.get(endpoint.service.getAll);
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
    const parsed = getAllServicesResponseDtoSchema.safeParse(adaptedRes);
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
