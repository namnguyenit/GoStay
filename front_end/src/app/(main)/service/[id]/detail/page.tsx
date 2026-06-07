import { RecommendationServices, ServiceServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [services, detailData] = await Promise.all([
    ServiceServices.getAll(),
    ServiceServices.getById(id),
  ]);
  const recommendations = detailData?.complexId
    ? await RecommendationServices.getByComplex(detailData.complexId)
    : await RecommendationServices.getNearbyForListing(id);

  return (
    <CategoryDetailScreen
      items={services}
      recommendations={recommendations}
      activeId={id}
      categoryType="service"
      detailData={detailData}
    />
  );
}
