import type { Service, Services } from "@/modules/service";
import type { getAllServicesResponseDto } from "@/dto/responses/service";

export const mapService = (
  getAllPlacesResponseDto: getAllServicesResponseDto,
): Services => {
  const data = getAllPlacesResponseDto?.data;

  const mapper = data?.map(
    (e): Service => ({
      ...e,
    }),
  );

  return mapper;
};
