import type { Place, Places } from "@/modules/place";
import type { getAllPlacesResponseDto } from "@/dto/responses/place";

export const mapPlaces = (
  getAllPlacesResponseDto: getAllPlacesResponseDto,
): Places => {
  const data = getAllPlacesResponseDto?.data;

  const mapper = data?.map(
    (e): Place => ({
      ...e,
      name: e?.title,
      image: e?.img,
    }),
  );

  return mapper;
};
