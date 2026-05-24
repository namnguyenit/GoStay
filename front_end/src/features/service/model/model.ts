import { z } from "zod";
import { ServiceSchema, ServicesSchema } from "./schema";

export type Service = z.infer<typeof ServiceSchema>;
export type Services = z.infer<typeof ServicesSchema>;
