import { ServiceServices } from "@/services";
import CategoryDetailScreen from "@/shared/components/CategoryDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const services = await ServiceServices.getAll();

  return (
    <CategoryDetailScreen
      items={services}
      activeId={id}
      categoryType="service"
    />
  );
}
