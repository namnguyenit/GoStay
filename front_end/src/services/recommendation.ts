import { Api } from "@/shared/api";

export type RecommendedListing = {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  basePrice?: number;
  rating?: number;
  averageRating?: number;
  address?: string;
  province?: string;
  image?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  category?: "STAY" | "EXP" | "SVC" | string;
  categoryType?: "place" | "experience" | "service";
  distanceMeters?: number;
};

type RawRecommendedListing = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  basePrice?: string | number;
  price?: string | number;
  averageRating?: string | number;
  rating?: string | number;
  province?: string;
  address?: string;
  thumbnailUrl?: string;
  image?: string;
  galleryUrls?: string[];
  category?: string;
  distanceMeters?: string | number;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
};

const toCategoryType = (category?: string) => {
  if (category === "STAY") return "place";
  if (category === "EXP") return "experience";
  if (category === "SVC") return "service";
  return undefined;
};

const mapRecommendedListing = (item: RawRecommendedListing): RecommendedListing => ({
  id: item.id,
  name: item.name || item.title,
  title: item.title || item.name,
  description: item.description,
  price: toNumber(item.price ?? item.basePrice),
  basePrice: toNumber(item.basePrice ?? item.price),
  rating: toNumber(item.rating ?? item.averageRating),
  averageRating: toNumber(item.averageRating ?? item.rating),
  address: item.address || item.province,
  province: item.province || item.address,
  image: item.image || item.thumbnailUrl,
  thumbnailUrl: item.thumbnailUrl || item.image,
  galleryUrls: item.galleryUrls ?? [],
  category: item.category,
  categoryType: toCategoryType(item.category),
  distanceMeters: toNumber(item.distanceMeters),
});

const RecommendationServices = {
  getNearbyForListing: async (listingId: string, limit = 30) => {
    if (!listingId) return [];

    try {
      const res = await Api.get(
        `/v1/recommendations/listings/${listingId}/similar?limit=${limit}`,
      );
      const data = res?.data ?? res ?? [];
      if (!Array.isArray(data)) return [];
      return (data as RawRecommendedListing[]).map(mapRecommendedListing);
    } catch (error) {
      console.error("Failed to fetch listing recommendations:", error);
      return [];
    }
  },
};

export default RecommendationServices;
