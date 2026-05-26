import type { RawPlace } from "./_raw";
import type { Place } from "./model";

export const mapper = (raw: RawPlace): Place => {
  if (!raw) return undefined;
  return {
    id: raw?.id || "",
    name: raw?.title ?? undefined,
    price: raw?.price ?? undefined,
    rating: raw?.rating ?? undefined,
    image: raw?.img ?? undefined,
  };
};
