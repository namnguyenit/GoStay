import { Suspense } from "react";
import { ServiceServices } from "@/services";
import CategoryGridClient from "@/shared/components/CategoryGridClient";

export default async function Page() {
  const services = await ServiceServices.getAll();

  return (
    <Suspense fallback={<div className="p-8 text-center text-app-muted-fg">Đang tải danh sách dịch vụ...</div>}>
      <CategoryGridClient
        items={services || []}
        categoryType="service"
        categoryLabel="Dịch vụ"
      />
    </Suspense>
  );
}
