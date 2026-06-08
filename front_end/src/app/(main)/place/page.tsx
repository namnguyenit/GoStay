import { Suspense } from "react";
import { PlaceServices } from "@/services";
import { GroupedOfferingLayout } from "@/shared/components";

export const dynamic = "force-dynamic";

export default async function Page() {
  const places = await PlaceServices.getAll();

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách nơi cư trú...</div>}>
      <GroupedOfferingLayout
        items={places || []}
        type="place"
        titlePrefix="Khách sạn tại"
      />
    </Suspense>
  );
}
