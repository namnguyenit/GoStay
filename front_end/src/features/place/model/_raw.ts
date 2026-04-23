import z from "zod";

export const RawPlaceSchema = z
  .object({
    id: z.string(),
    title: z.string().nullable().catch(null),
    price: z.number().nullable().catch(null),
    rating: z.number().nullable().catch(null),
    img: z.string().nullable().catch(null),
  })
  .nullable()
  .catch(null);

export type RawPlace = z.infer<typeof RawPlaceSchema>;
