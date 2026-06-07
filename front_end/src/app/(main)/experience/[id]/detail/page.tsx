import { ExperienceServices, RecommendationServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [experiences, detailData, recommendations] = await Promise.all([
    ExperienceServices.getAll(),
    ExperienceServices.getById(id),
    RecommendationServices.getNearbyForListing(id),
  ]);

  return (
    <CategoryDetailScreen
      items={experiences}
      recommendations={recommendations}
      activeId={id}
      categoryType="experience"
      detailData={detailData}
    />
  );
}
