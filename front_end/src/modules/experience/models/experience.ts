export type Experience =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
    }
  | undefined;
