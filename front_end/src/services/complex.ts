import { endpoint } from "@/config";
import { Api } from "@/shared/api";

export type ComplexOffering = {
  id?: string;
  name?: string;
  description?: string;
  province?: string;
  address?: string;
  image?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  listingCount?: number;
  distanceMeters?: number;
};

type RawComplex = Record<string, unknown>;

const asRecord = (value: unknown): RawComplex =>
  value && typeof value === "object" ? (value as RawComplex) : {};

const asString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const asNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
};

const mapComplex = (item: unknown): ComplexOffering => {
  const raw = asRecord(item);
  const thumbnailUrl = asString(raw.thumbnailUrl) || asString(raw.thumbnail_url);

  return {
    id: asString(raw.id),
    name: asString(raw.name),
    description: asString(raw.description),
    province: asString(raw.province),
    address: asString(raw.province),
    image: thumbnailUrl,
    thumbnailUrl,
    galleryUrls: asStringArray(raw.galleryUrls || raw.gallery_urls),
    listingCount: asNumber(raw.listingCount ?? raw.listing_count) ?? 0,
    distanceMeters: asNumber(raw.distanceMeters),
  };
};

const ComplexServices = {
  getAll: async () => {
    const res = await Api.get(endpoint.complex.getAll);
    const data = res?.data ?? res ?? [];
    const dataRecord = asRecord(data);
    const items = Array.isArray(dataRecord.content)
      ? dataRecord.content
      : Array.isArray(data)
        ? data
        : [];

    return items.map(mapComplex);
  },
  getForLocation: async (place?: string) => {
    const query = place?.trim();
    if (!query) return ComplexServices.getAll();

    const suggestionsRes = await Api.get(endpoint.complex.suggestLocations(query));
    const suggestions = Array.isArray(suggestionsRes?.data)
      ? suggestionsRes.data
      : Array.isArray(suggestionsRes)
        ? suggestionsRes
        : [];
    const topSuggestion = asRecord(suggestions[0]);
    const type = asString(topSuggestion.type);

    if (type === "LANDMARK" && topSuggestion.id) {
      const nearbyRes = await Api.get(endpoint.complex.getByLandmark(String(topSuggestion.id)));
      const nearbyData = nearbyRes?.data ?? nearbyRes ?? {};
      const nearbyRecord = asRecord(nearbyData);
      const nearbyComplexes = Array.isArray(nearbyRecord.COMPLEX)
        ? nearbyRecord.COMPLEX
        : [];
      return nearbyComplexes.map(mapComplex);
    }

    if (type === "PROVINCE" && topSuggestion.province) {
      const provinceRes = await Api.get(
        endpoint.complex.getByProvince(String(topSuggestion.province)),
      );
      const provinceData = provinceRes?.data ?? provinceRes ?? [];
      const destinations = Array.isArray(provinceData) ? provinceData : [];
      return destinations
        .filter((item) => asString(asRecord(item).destinationType) === "COMPLEX")
        .map(mapComplex);
    }

    if (type === "COMPLEX") {
      return [mapComplex(topSuggestion)];
    }

    return ComplexServices.getAll();
  },
  mapComplex,
};

export default ComplexServices;
