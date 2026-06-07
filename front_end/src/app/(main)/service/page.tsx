import { Suspense } from "react";
import { ServiceServices } from "@/services";
import ServiceCategoryLanding from "@/shared/components/ServiceCategoryLanding";

export default async function Page() {
  const services = await ServiceServices.getAll();

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách dịch vụ...</div>}>
      <ServiceCategoryLanding services={services || []} />
    </Suspense>
  );
}
