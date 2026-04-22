import { API, parseApiResponse } from "@/shared";
import { ExperiencesSchema } from "@/features/experience";

const ExperienceService = {
  fetch: async () => {
    const res = await API.get("/service");
    const parsed = parseApiResponse(res, ExperiencesSchema);
    return parsed;
  },
};

export default ExperienceService;
