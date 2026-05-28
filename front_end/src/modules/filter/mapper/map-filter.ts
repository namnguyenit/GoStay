import { Filter } from "../models/filter";
import type { FilterQueryDto } from "@/dto/query/filter";

export const mapFilter = (filterQueryDto: FilterQueryDto): Filter => {
  return {
    place: filterQueryDto.place,
    type: filterQueryDto.type,
    date: {
      from: filterQueryDto?.from ? new Date(filterQueryDto.from) : undefined,
      to: filterQueryDto?.to ? new Date(filterQueryDto.to) : undefined,
    },
  };
};
