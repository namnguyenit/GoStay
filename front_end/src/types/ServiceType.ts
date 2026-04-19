import { z } from "zod";

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string().nullable().default(null).catch(null),
  price: z.number().nullable().default(null).catch(null),
  description: z.string().nullable().default(null).catch(null),
  address: z.string().nullable().default(null).catch(null),
  rating: z.number().nullable().default(null).catch(null),
  image: z.string().nullable().default(null).catch(null),
});

const ServicesSchema = z.array(ServiceSchema);

export type ServiceType = z.infer<typeof ServiceSchema>;
