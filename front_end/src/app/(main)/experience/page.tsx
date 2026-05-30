import { Suspense } from "react";
import { ExperienceServices } from "@/services";
import CategoryGridClient from "@/shared/components/CategoryGridClient";

export default async function Page() {
  const experiences = await ExperienceServices.getAll();

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách trải nghiệm...</div>}>
      <CategoryGridClient
        items={experiences || []}
        categoryType="experience"
        categoryLabel="Trải nghiệm"
      />
    </Suspense>
  );
}
