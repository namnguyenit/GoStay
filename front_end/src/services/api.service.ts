import z from "zod";

const Api = {
  get: async <T extends z.ZodTypeAny>(url: string, schema: T) => {
    const res = await fetch(url);
    const json = await res.json();

    const parsed = z
      .object({
        success: z.boolean().catch(false),
        message: z.string().nullable().catch(null),
        code: z.string().nullable().catch(null),
        data: schema.nullable().catch(null),
      })
      .nullable()
      .catch(null)
      .safeParse(json);

    return parsed.success ? parsed.data : null;
  },
};

export default Api;
