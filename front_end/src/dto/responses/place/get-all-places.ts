import z from "zod";

export const getAllPlacesResponseDtoSchema = z
  .object({
    success: z.boolean().default(false).catch(false),
    message: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    data: z
      .array(
        z
          .object({
            id: z.string().optional(),
            title: z.string().optional(),
            price: z.number().optional(),
            rating: z.number().optional(),
            img: z.string().optional(),
          })
          .optional()
          .catch(undefined),
      )
      .optional()
      .catch(undefined),
  })
  .optional()
  .catch(undefined);

export type getAllPlacesResponseDto = z.infer<
  typeof getAllPlacesResponseDtoSchema
>;
