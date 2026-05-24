import z from "zod";

const parseApiResponse = <T extends z.ZodTypeAny>(raw: any, schema: T) => {
  const parsed = z
    .object({
      success: z.boolean().catch(false),
      message: z.string().nullable().catch(null),
      code: z.string().nullable().catch(null),
      data: schema.nullable().catch(null),
    })
    .nullable()
    .catch(null)
    .safeParse(raw);

  return parsed.success ? parsed.data : null;
};

export default parseApiResponse;
