import type { RawPlace } from "./_raw";
import type { Place } from "./model";

export const mapper = (raw: RawPlace): Place => {
  if (!raw) return null;
  return {
    id: raw?.id || "",
    name: raw?.title ?? null,
    price: raw?.price ?? null,
    rating: raw?.rating ?? null,
    image: raw?.img ?? null,
  };
};
