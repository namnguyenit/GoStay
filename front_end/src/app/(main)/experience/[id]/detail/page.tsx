import { ExperienceServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const experiences = await ExperienceServices.getAll();
  const detailData = await ExperienceServices.getById(id);

  return (
    <CategoryDetailScreen
      items={experiences}
      activeId={id}
      categoryType="experience"
      detailData={detailData}
    />
  );
}
