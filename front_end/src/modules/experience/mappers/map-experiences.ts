import { Experience, Experiences } from "@/modules/experience";
import type { getAllExperiencesResponseDto } from "@/dto/responses/experience";

export const mapExperiences = (
  getAllExperiencesResponseDto: getAllExperiencesResponseDto,
): Experiences => {
  const data = getAllExperiencesResponseDto?.data;

  const mapper = data?.map(
    (e): Experience => ({
      ...e,
    }),
  );

  return mapper;
};
