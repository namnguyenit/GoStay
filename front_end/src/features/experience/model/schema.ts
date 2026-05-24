import z from "zod";

export const ExperienceSchema = z
  .object({
    id: z.string(),
    name: z.string().optional().catch(undefined),
    price: z.number().optional().catch(undefined),
    description: z.string().optional().catch(undefined),
    address: z.string().optional().catch(undefined),
    rating: z.number().optional().catch(undefined),
    image: z.string().optional().catch(undefined),
  })
  .optional()
  .catch(undefined);

export const ExperiencesSchema = z.array(ExperienceSchema).nullable();
