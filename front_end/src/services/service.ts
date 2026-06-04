import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllServicesResponseDtoSchema } from "@/dto/responses/service";
import { mapService } from "@/modules/service";

const ServiceServices = {
  getAll: async () => {
    const res = await Api.get(endpoint.service.getAll);
    // Parse DTO
    let adaptedRes = res;
    let items = res?.data?.content || res?.data?.data;
    if (Array.isArray(res?.data)) {
      items = res.data;
    }
    
    if (items && Array.isArray(items)) {
      adaptedRes = {
        ...res,
        data: items.map((item: any) => ({
          id: item.id,
          name: item.title,
          price: item.basePrice ? Number(item.basePrice) : undefined,
          rating: item.averageRating ? Number(item.averageRating) : undefined,
          image: item.thumbnailUrl,
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
