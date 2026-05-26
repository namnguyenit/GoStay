import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllExperiencesResponseDtoSchema } from "@/dto/responses/experience";
import { mapExperiences } from "@/modules/experience";

const ExperienceServices = {
  getAll: async () => {
    // Call API
    const res = await Api.get(endpoint.experience.getAll);
    // Parse DTO
    const parsed = getAllExperiencesResponseDtoSchema.safeParse(res);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapExperiences(parsed.data);

    return mapper;
  },
};

export default ExperienceServices;
