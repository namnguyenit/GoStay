import { Suspense } from "react";
import { ComplexServices, ExperienceServices } from "@/services";
import { GroupedOfferingLayout } from "@/shared/components";

export default async function Page() {
  const [experiences, complexes] = await Promise.all([
    ExperienceServices.getAll(),
    ComplexServices.getAll(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách trải nghiệm...</div>}>
      <GroupedOfferingLayout
        items={experiences || []}
        type="experience"
        titlePrefix="Trải nghiệm tại"
        complexes={complexes || []}
      />
    </Suspense>
  );
}
