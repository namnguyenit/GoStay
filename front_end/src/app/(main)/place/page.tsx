import { Suspense } from "react";
import { PlaceServices } from "@/services";
import CategoryGridClient from "@/shared/components/CategoryGridClient";

export default async function Page() {
  const places = await PlaceServices.getAll();

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách nơi cư trú...</div>}>
      <CategoryGridClient
        items={places || []}
        categoryType="place"
        categoryLabel="Nơi cư trú"
      />
    </Suspense>
  );
}
