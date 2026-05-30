import z from "zod";

export const FilterQueryDtoSchema = z
  .object({
    place: z.string().catch(""),
    type: z.string().catch(""),
    from: z.string().optional().catch(undefined),
    to: z.string().optional().catch(undefined),
  })
  .transform((e) => ({
    ...e,
    from: e?.from ? new Date(e.from) : undefined,
    to: e?.to ? new Date(e.to) : undefined,
  }));

export type FilterQueryDto = z.infer<typeof FilterQueryDtoSchema>;
