import z from "zod";

export const getAllExperiencesResponseDtoSchema = z
  .object({
    success: z.boolean().default(false).catch(false),
    message: z.string().optional().catch(undefined),
    code: z.string().optional().catch(undefined),
    data: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string().optional(),
            price: z.number().optional(),
            description: z.string().optional(),
            address: z.string().optional(),
            rating: z.number().optional(),
            image: z.string().optional(),
            thumbnailUrl: z.string().optional(),
            referenceImageUrl: z.string().optional(),
            galleryUrls: z.array(z.string()).optional(),
            images: z.array(z.string()).optional(),
            imageUrls: z.array(z.string()).optional(),
          })
          .optional()
          .catch(undefined),
      )
      .optional()
      .catch(undefined),
  })
  .optional()
  .catch(undefined);

export type getAllExperiencesResponseDto = z.infer<
  typeof getAllExperiencesResponseDtoSchema
>;
