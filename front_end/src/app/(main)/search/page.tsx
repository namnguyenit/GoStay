import { Suspense } from "react";
import { ComplexServices, PlaceServices, ExperienceServices, ServiceServices } from "@/services";
import SearchClient from "@/screens/search/components/SearchClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const placeQuery = Array.isArray(resolvedSearchParams.place)
    ? resolvedSearchParams.place[0]
    : resolvedSearchParams.place;
  const checkIn = Array.isArray(resolvedSearchParams.from)
    ? resolvedSearchParams.from[0]
    : resolvedSearchParams.from;
  const checkOutRaw = Array.isArray(resolvedSearchParams.to)
    ? resolvedSearchParams.to[0]
    : resolvedSearchParams.to;
  const checkOut = checkOutRaw || checkIn;
  const subCategory = Array.isArray(resolvedSearchParams.subCategory)
    ? resolvedSearchParams.subCategory[0]
    : resolvedSearchParams.subCategory;
  const searchOptions = {
    locationQuery: placeQuery,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    limit: 500,
  };
  const serviceSearchOptions = {
    ...searchOptions,
    subCategory: subCategory || undefined,
  };

  // Pre-fetch all lists from services
  const [places, experiences, services, serviceCategoryItems, complexes] = await Promise.all([
    PlaceServices.getAll(searchOptions) || [],
    ExperienceServices.getAll(searchOptions) || [],
    ServiceServices.getAll(serviceSearchOptions) || [],
    ServiceServices.getAll(searchOptions) || [],
    ComplexServices.getForLocation(placeQuery) || [],
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải kết quả tìm kiếm...</div>}>
      <SearchClient
        places={places || []}
        experiences={experiences || []}
        services={services || []}
        serviceCategoryItems={serviceCategoryItems || []}
        complexes={complexes || []}
        searchParamsRaw={resolvedSearchParams}
      />
    </Suspense>
  );
}
