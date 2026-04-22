import z from "zod";

export const ExperienceSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().default(null).catch(null),
    price: z.number().nullable().default(null).catch(null),
    description: z.string().nullable().default(null).catch(null),
    address: z.string().nullable().default(null).catch(null),
    rating: z.number().nullable().default(null).catch(null),
    image: z.string().nullable().default(null).catch(null),
  })
  .nullable();

export const ExperiencesSchema = z.array(ExperienceSchema).nullable();
