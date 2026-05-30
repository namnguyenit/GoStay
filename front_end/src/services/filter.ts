import { Filter } from "@/modules/filter";
import { FilterQueryDtoSchema } from "@/dto/query/filter";
import { mapFilter } from "@/modules/filter/mapper/map-filter";

export const FilterService = {
  get: (params: URLSearchParams): Filter => {
   
    //parse
    const parsed = FilterQueryDtoSchema.safeParse({
      place: params.get("place"),
      type: params.get("type"),
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
    params.set("from", value?.date?.from?.toString() ?? "");
    params.set("to", value?.date?.to?.toString() ?? "");

    return params;
  },
};
