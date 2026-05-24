import { Api } from "@/shared/api";
import { parseApiResponse } from "@/shared/parsers";
import { ExperiencesSchema } from "@/features/experience";
import { endpoint } from "@/config";

const ExperienceService = {
  getAll: async () => {
    const res = await Api.get(endpoint.experience.getAll);
    const parsed = parseApiResponse(res, ExperiencesSchema);
    return parsed;
  },
};

export default ExperienceService;
