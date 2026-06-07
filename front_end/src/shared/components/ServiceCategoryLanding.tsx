"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ListingGridCard from "./ListingGridCard";

type ServiceLandingItem =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
      subCategory?: string;
      thumbnailUrl?: string;
      referenceImageUrl?: string;
      galleryUrls?: string[];
      images?: string[];
      imageUrls?: string[];
    }
  | undefined;

type ServiceCategoryLandingProps = {
  services: ServiceLandingItem[];
};

const SERVICE_CATEGORY_OPTIONS = [
  { value: "PHOTOGRAPHY", label: "Chụp ảnh" },
  { value: "CHEF", label: "Đầu bếp" },
  { value: "MASSAGE", label: "Massage" },
  { value: "PREPARED_MEALS", label: "Đồ ăn chuẩn bị sẵn" },
  { value: "TRAINING", label: "Đào tạo" },
  { value: "MAKEUP", label: "Trang điểm" },
  { value: "HAIR_STYLING", label: "Làm tóc" },
  { value: "SPA", label: "Chăm sóc spa" },
  { value: "CATERING", label: "Dịch vụ ăn uống" },
];

const getImage = (item: NonNullable<ServiceLandingItem>) =>
  item.thumbnailUrl ||
  item.image ||
  item.galleryUrls?.[0] ||
  item.images?.[0] ||
  item.imageUrls?.[0];

export default function ServiceCategoryLanding({
  services,
}: ServiceCategoryLandingProps) {
  const router = useRouter();
  const availableServices = useMemo(
    () => (services ?? []).filter((item): item is NonNullable<ServiceLandingItem> => Boolean(item?.id)),
    [services],
  );

  const categoryStats = useMemo(() => {
    const counts = new Map<string, { count: number; image?: string }>();

    availableServices.forEach((item) => {
      if (!item.subCategory || item.subCategory === "NONE") return;
      const current = counts.get(item.subCategory) ?? { count: 0, image: undefined };
      counts.set(item.subCategory, {
        count: current.count + 1,
        image: current.image || getImage(item),
      });
    });

    return SERVICE_CATEGORY_OPTIONS.map((option) => ({
      ...option,
      count: counts.get(option.value)?.count ?? 0,
      image: counts.get(option.value)?.image,
    })).filter((option) => option.count > 0);
  }, [availableServices]);

  const [activeSubCategory, setActiveSubCategory] = useState(
    () => categoryStats[0]?.value ?? "",
  );

  const activeCategory =
    categoryStats.find((item) => item.value === activeSubCategory) ??
    categoryStats[0];
  const activeServices = activeCategory
    ? availableServices.filter((item) => item.subCategory === activeCategory.value)
    : [];

  if (!categoryStats.length) {
    return (
      <div className="min-h-screen bg-white px-6 py-20 text-center text-[#717171]">
        Chưa có dịch vụ khả dụng.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 text-[#222222]">
      <div className="mx-auto max-w-[1760px] px-6 pt-10 md:px-10 xl:px-20">
        <section className="mb-10">
          <h1 className="mb-4 text-[22px] font-bold leading-[26px] tracking-normal md:text-2xl">
            Dịch vụ theo loại hình
          </h1>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
            {categoryStats.map((category) => {
              const selected = activeCategory?.value === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveSubCategory(category.value)}
                  className="group text-left"
                >
                  <div
                    className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f7f7f7] transition ${
                      selected
                        ? "ring-2 ring-[#222222] ring-offset-2"
                        : "group-hover:ring-1 group-hover:ring-[#222222]/30 group-hover:ring-offset-2"
                    }`}
                  >
                    {category.image ? (
                      <Image
                        unoptimized
                        fill
                        src={category.image}
                        alt={category.label}
                        className="object-cover"
                        sizes="180px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-semibold text-[#717171]">
                        GoStay
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#222222]">
                    {category.label}
                  </div>
                  <div className="mt-0.5 text-sm text-[#717171]">
                    Có {category.count} dịch vụ
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-[22px] font-bold leading-[26px] tracking-normal md:text-2xl">
            Khám phá {activeServices.length} dịch vụ {activeCategory?.label.toLowerCase()}
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {activeServices.map((item) => (
              <ListingGridCard
                key={item.id}
                item={item}
                categoryLabel="Dịch vụ"
                unit="/ dịch vụ"
                onSelect={() => router.push(`/service/${item.id}/detail`)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
