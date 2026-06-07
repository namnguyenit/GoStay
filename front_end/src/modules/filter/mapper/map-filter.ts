import { Filter } from "../models/filter";
import type { FilterQueryDto } from "@/dto/query/filter";

const normalizeSubCategory = (value?: string) =>
  value?.startsWith("SVC_") ? value.slice(4) : value;

export const mapFilter = (filterQueryDto: FilterQueryDto): Filter => {
  return {
    place: filterQueryDto.place,
    type: filterQueryDto.type,
    subCategory: normalizeSubCategory(filterQueryDto.subCategory),
    date: {
      from: filterQueryDto?.from ? new Date(filterQueryDto.from) : undefined,
      to: filterQueryDto?.to ? new Date(filterQueryDto.to) : undefined,
    },
  };
};
