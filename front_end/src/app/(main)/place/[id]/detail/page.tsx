import { PlaceServices, RecommendationServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [places, detailData] = await Promise.all([
    PlaceServices.getAll(),
    PlaceServices.getById(id),
  ]);
  const recommendations = detailData?.complexId
    ? await RecommendationServices.getByComplex(detailData.complexId)
    : await RecommendationServices.getNearbyForListing(id);

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
