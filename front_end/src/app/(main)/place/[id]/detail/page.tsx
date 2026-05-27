import { PlaceServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const places = await PlaceServices.getAll();

  return (
    <CategoryDetailScreen
      items={places}
      activeId={id}
      categoryType="place"
    />
  );
}
