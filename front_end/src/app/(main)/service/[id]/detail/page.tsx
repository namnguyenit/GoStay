import { RecommendationServices, ServiceServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [services, detailData, recommendations] = await Promise.all([
    ServiceServices.getAll(),
    ServiceServices.getById(id),
    RecommendationServices.getNearbyForListing(id),
  ]);

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
