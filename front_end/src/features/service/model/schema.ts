import z from "zod";

export const ServiceSchema = z
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

export const ServicesSchema = z
  .array(ServiceSchema)
  .optional()
  .catch(undefined);
