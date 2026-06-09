import { Suspense } from "react";
import { PlaceServices, ExperienceServices, ServiceServices } from "@/services";
import SearchClient from "@/screens/search/components/SearchClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // Pre-fetch all lists from services
  const [places, experiences, services] = await Promise.all([
    PlaceServices.getAll() || [],
    ExperienceServices.getAll() || [],
    ServiceServices.getAll() || [],
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải kết quả tìm kiếm...</div>}>
      <SearchClient
        places={places || []}
        experiences={experiences || []}
        services={services || []}
      />
    </Suspense>
  );
}
