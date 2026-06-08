import { Filter } from "@/modules/filter";
import { FilterQueryDtoSchema } from "@/dto/query/filter";
import { mapFilter } from "@/modules/filter/mapper/map-filter";

const toDateParam = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

export const FilterService = {
  get: (params: URLSearchParams): Filter => {
   
    //parse
    const parsed = FilterQueryDtoSchema.safeParse({
      place: params.get("place"),
      type: params.get("type"),
      subCategory: params.get("subCategory"),
      from: params.get("from"),
      to: params.get("to"),
    });
    if (!parsed.success) {
      return;
    }
    //Dto
    const dto = parsed.data;
    //mapper
    const mapper = mapFilter(dto);

    return mapper;
  },
  set: (value: Filter): URLSearchParams => {
    const params = new URLSearchParams();

    params.set("place", value?.place?.toString() ?? "");
    params.set("type", value?.type?.toString() ?? "");
    params.set("subCategory", value?.subCategory?.toString() ?? "");
    params.set("from", toDateParam(value?.date?.from));
    params.set("to", toDateParam(value?.date?.to));

    return params;
  },
};
