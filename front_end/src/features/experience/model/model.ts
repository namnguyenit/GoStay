import { z } from "zod";
import { ExperienceSchema, ExperiencesSchema } from "./schema";

export type Experience = z.infer<typeof ExperienceSchema>;
export type Experiences = z.infer<typeof ExperiencesSchema>;
