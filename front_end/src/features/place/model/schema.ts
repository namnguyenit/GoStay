import z from "zod";
import { mapper } from "./mapper";
import { RawPlaceSchema } from "./_raw";

export const PlaceSchema = RawPlaceSchema.transform(mapper);
export const PlacesSchema = z
  .array(PlaceSchema)
  .nullable()
  .transform((value) => value?.filter((e, index) => e));
