import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllExperiencesResponseDtoSchema } from "@/dto/responses/experience";
import { mapExperiences } from "@/modules/experience";

const ExperienceServices = {
  getAll: async () => {
    const res = await Api.get(endpoint.experience.getAll);
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
    const parsed = getAllExperiencesResponseDtoSchema.safeParse(adaptedRes);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapExperiences(parsed.data);

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
};

export default ExperienceServices;
