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
  getById: async (id: string) => {
    try {
      const res = await Api.get(`/v1/catalog/listings/${id}`);
      return res?.data ?? null;
    } catch (err) {
      console.error(`Failed to fetch listing ${id}:`, err);
      return null;
    }
  },
  getReviews: async (listingId: string, page = 0, size = 10) => {
    return await Api.get(`/v1/catalog/listings/${listingId}/reviews?page=${page}&size=${size}`);
  },
  submitReview: async (payload: { listingId: string; rating: number; comment: string; images: string[] }) => {
    return await Api.post("/v1/catalog/reviews", payload);
  },
};

export default ServiceServices;
