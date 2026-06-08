import { Api } from "@/shared/api";
import { endpoint } from "@/config";
import { getAllPlacesResponseDtoSchema } from "@/dto/responses/place/get-all-places";
import { mapPlaces } from "@/modules/place/mappers/map-places";

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
  category?: string;
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

const normalizeNearbyListing = (item: RawListing) => ({
  ...item,
  galleryUrls: getListingGallery(item),
});

export type ListingSearchOptions = {
  locationQuery?: string;
  checkIn?: string;
  checkOut?: string;
  limit?: number;
  subCategory?: string;
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

const PlaceServices = {
  getAll: async (options?: ListingSearchOptions) => {
    const res = await Api.get(withSearchParams(endpoint.place.getAll, options));
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
          title: item.title,
          description: item.description,
          price: item.basePrice ? Number(item.basePrice) : undefined,
          rating: item.averageRating ? Number(item.averageRating) : undefined,
          img: item.thumbnailUrl,
          thumbnailUrl: item.thumbnailUrl,
          referenceImageUrl: item.referenceImageUrl,
          galleryUrls: getListingGallery(item),
          address: item.province,
        }))
      };
    }
    const parsed = getAllPlacesResponseDtoSchema.safeParse(adaptedRes);
    if (!parsed.success) {
      console.error(parsed.error);
      return undefined;
    }
    // Map
    const mapper = mapPlaces(parsed.data);

    // console.log(mapper);
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

  getNearbyListings: async (landmarkId: string, radiusMeters: number = 5000) => {
    try {
      const res = await Api.get(endpoint.place.getNearbyListings.replace('{id}', landmarkId) + '?radius=' + radiusMeters);
      const data = res?.data ?? res;

      if (Array.isArray(data)) {
        return {
          STAY: (data as RawListing[]).filter((item) => item?.category === "STAY").map(normalizeNearbyListing),
          EXP: (data as RawListing[]).filter((item) => item?.category === "EXP").map(normalizeNearbyListing),
          SVC: (data as RawListing[]).filter((item) => item?.category === "SVC").map(normalizeNearbyListing),
          COMPLEX: [],
        };
      }

      return {
        STAY: Array.isArray(data?.STAY) ? data.STAY.map(normalizeNearbyListing) : [],
        EXP: Array.isArray(data?.EXP) ? data.EXP.map(normalizeNearbyListing) : [],
        SVC: Array.isArray(data?.SVC) ? data.SVC.map(normalizeNearbyListing) : [],
        COMPLEX: data?.COMPLEX ?? [],
      };
    } catch (err) {
      console.error("Failed to fetch nearby listings:", err);
      return { STAY: [], EXP: [], SVC: [], COMPLEX: [] };
    }
  },
  getLandmarks: async () => {
    try {
      const res = await Api.get(endpoint.place.getLandmarks);
      return res?.data ?? [];
    } catch (err) {
      console.error("Failed to fetch landmarks:", err);
      return [];
    }
  }
};

export default PlaceServices;
