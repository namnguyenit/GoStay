import { z } from "zod";
import { PlaceSchema, PlacesSchema } from "./schema";

export type Place = {
  id: string;
  name: string | null;
  price: number | null;
  rating: number | null;
  image: string | null;
} | null;

export type Places = Place[] | null;
