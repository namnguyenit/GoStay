import { PlaceServices, RecommendationServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [places, detailData, recommendations] = await Promise.all([
    PlaceServices.getAll(),
    PlaceServices.getById(id),
    RecommendationServices.getNearbyForListing(id),
  ]);

  return (
    <CategoryDetailScreen
      items={places}
      recommendations={recommendations}
      activeId={id}
      categoryType="place"
      detailData={detailData}
    />
  );
}
