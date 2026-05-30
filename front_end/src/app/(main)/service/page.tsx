import { Suspense } from "react";
import { ServiceServices } from "@/services";
import { GroupedOfferingLayout } from "@/shared/components";

export default async function Page() {
  const services = await ServiceServices.getAll();

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách dịch vụ...</div>}>
      <GroupedOfferingLayout
        items={services || []}
        type="service"
        titlePrefix="Dịch vụ tại"
      />
    </Suspense>
  );
}
