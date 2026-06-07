import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllExperiencesResponseDtoSchema } from "@/dto/responses/experience";
import { mapExperiences } from "@/modules/experience";
import type { ListingSearchOptions } from "./place";

type RawListing = {
  id?: string;
  title?: string;
  description?: string;
  basePrice?: string | number;
  averageRating?: string | number;
  thumbnailUrl?: string;
  referenceImageUrl?: string;
  galleryUrls?: string[];
  images?: string[];
  imageUrls?: string[];
  attributes?: {
    galleryUrls?: string[];
    images?: string[];
    imageUrls?: string[];
  };
  province?: string;
};

const getListingGallery = (item: RawListing) => {
  const urls = [
    ...(item.galleryUrls ?? []),
    ...(item.imageUrls ?? []),
    ...(item.images ?? []),
    ...(item.attributes?.galleryUrls ?? []),
    ...(item.attributes?.imageUrls ?? []),
    ...(item.attributes?.images ?? []),
  ];

  return urls.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
};

const withSearchParams = (baseEndpoint: string, options: ListingSearchOptions = {}) => {
  const url = new URL(baseEndpoint, "http://gotravel.local");

  if (options.locationQuery?.trim()) {
    url.searchParams.set("locationQuery", options.locationQuery.trim());
  }
  if (options.checkIn && options.checkOut) {
    url.searchParams.set("checkIn", options.checkIn);
    url.searchParams.set("checkOut", options.checkOut);
  }
  if (options.limit) {
    url.searchParams.set("limit", String(options.limit));
  }

  return `${url.pathname}${url.search}`;
};

const ExperienceServices = {
  getAll: async (options?: ListingSearchOptions) => {
    const res = await Api.get(withSearchParams(endpoint.experience.getAll, options));
    // Parse DTO
    let adaptedRes = res;
    let items = res?.data?.content || res?.data?.data;
    if (Array.isArray(res?.data)) {
      items = res.data;
    }
    
    if (items && Array.isArray(items)) {
      adaptedRes = {
        ...res,
        data: (items as RawListing[]).map((item) => ({
          id: item.id,
          name: item.title,
          description: item.description,
          price: item.basePrice ? Number(item.basePrice) : undefined,
          rating: item.averageRating ? Number(item.averageRating) : undefined,
          image: item.thumbnailUrl,
          thumbnailUrl: item.thumbnailUrl,
          referenceImageUrl: item.referenceImageUrl,
          galleryUrls: getListingGallery(item),
          address: item.province,
        }))
      };
    }
    const parsed = getAllExperiencesResponseDtoSchema.safeParse(adaptedRes);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapExperiences(parsed.data);

    return mapper;
  },
  getById: async (id: string) => {
    try {
      const res = await Api.get(`/v1/catalog/listings/${id}`);
      return res?.data ?? null;
    } catch (err) {
      console.error(`Failed to fetch listing ${id}:`, err);
      return null;
    }
  },
};

export default ExperienceServices;
