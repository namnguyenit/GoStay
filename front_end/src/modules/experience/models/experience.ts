export type Experience =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
      thumbnailUrl?: string;
      referenceImageUrl?: string;
      galleryUrls?: string[];
      images?: string[];
      imageUrls?: string[];
    }
  | undefined;
