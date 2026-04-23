import { API, parseApiResponse } from "@/shared";
import { ExperiencesSchema } from "@/features/experience";
import { endpoint } from "@/config";

const ExperienceService = {
  getAll: async () => {
    const res = await API.get(endpoint.experience.getAll);
    const parsed = parseApiResponse(res, ExperiencesSchema);
    return parsed;
  },
};

export default ExperienceService;
