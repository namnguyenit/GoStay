import { ComplexServices, RecommendationServices } from "@/services";
import ComplexDetailScreen from "@/shared/components/ComplexDetailScreen";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [complex, listings] = await Promise.all([
    ComplexServices.getById(id),
    RecommendationServices.getByComplex(id, 50),
  ]);

  if (!complex) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-semibold text-[#717171]">
        Không tìm thấy khu du lịch này.
      </div>
    );
  }

  return <ComplexDetailScreen complex={complex} listings={listings} />;
}
