import { z } from "zod";
import { PlaceSchema, PlacesSchema } from "./schema";

export type Place =
  | {
      id: string;
      name?: string;
      price?: number;
      rating?: number;
      image?: string;
    }
  | undefined;

export type Places = Place[] | undefined;
