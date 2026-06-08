"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";

import type { ComplexOffering } from "@/services/complex";
import type { RecommendedListing } from "@/services/recommendation";
import { formatMoney } from "@/shared/utils";

type ComplexDetailScreenProps = {
  complex: ComplexOffering;
  listings: RecommendedListing[];
};

const getCategoryType = (item: RecommendedListing) => {
  if (item.categoryType) return item.categoryType;
  if (item.category === "STAY") return "place";
  if (item.category === "EXP") return "experience";
  return "service";
};

const getCategoryLabel = (item: RecommendedListing) => {
  const type = getCategoryType(item);
  if (type === "place") return "Nơi lưu trú";
  if (type === "experience") return "Trải nghiệm";
  return "Dịch vụ";
};

const getUnit = (item: RecommendedListing) => {
  const type = getCategoryType(item);
  if (type === "place") return "/ đêm";
  if (type === "experience") return "/ nhóm";
  return "/ dịch vụ";
};

export default function ComplexDetailScreen({
  complex,
  listings,
}: ComplexDetailScreenProps) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const images = useMemo(
    () =>
      Array.from(
        new Set(
          [
            complex.thumbnailUrl,
            complex.image,
            ...(complex.galleryUrls ?? []),
          ].filter((url): url is string => Boolean(url?.trim())),
        ),
      ),
    [complex],
  );
  const safeImageIndex = images.length > 0 ? Math.min(imageIndex, images.length - 1) : 0;
  const activeImage = images[safeImageIndex] || "/images/placeholder.jpg";

  return (
    <div className="min-h-screen bg-white pb-20 text-[#222222]">
      <div className="border-b border-[#eeeeee] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#717171] transition hover:bg-[#f7f7f7] hover:text-[#222222]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="relative aspect-video overflow-hidden rounded-[28px] bg-[#f7f7f7] shadow-sm">
            <Image
              unoptimized
              fill
              src={activeImage}
              alt={complex.name || "Khu du lịch"}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 760px"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.slice(0, 5).map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl border bg-[#f7f7f7] transition ${
                    safeImageIndex === index
                      ? "border-[#e61e4d] ring-2 ring-[#e61e4d]/20"
                      : "border-[#dddddd] hover:border-[#222222]"
                  }`}
                >
                  <Image
                    unoptimized
                    fill
                    src={url}
                    alt={`${complex.name || "Khu du lịch"} ${index + 1}`}
                    className="object-cover"
                    sizes="160px"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#717171]">
              <span className="rounded-full bg-[#f7f7f7] px-3 py-1">Khu du lịch & tổ hợp</span>
              {complex.province && (
                <span className="flex items-center gap-1 rounded-full bg-[#f7f7f7] px-3 py-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {complex.province}
                </span>
              )}
              <span className="rounded-full bg-[#f7f7f7] px-3 py-1">
                {listings.length || complex.listingCount || 0} dịch vụ trong khu
              </span>
            </div>

            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-[-0.03em]">
              {complex.name || "Khu du lịch GoTravel"}
            </h1>

            <div className="my-6 h-px bg-[#eeeeee]" />

            <div className="rounded-3xl border border-[#eeeeee] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f7f7] text-[#222222]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Giới thiệu tổ hợp</h2>
                  <p className="text-sm text-[#717171]">Các dịch vụ bên phải đều thuộc khu này.</p>
                </div>
              </div>
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#444444]">
                {complex.description ||
                  "Khu tổ hợp này tập hợp nhiều dịch vụ lưu trú, trải nghiệm và tiện ích trong cùng một không gian vận hành."}
              </p>
            </div>
          </div>
        </section>

        <aside className="border-t border-[#eeeeee] pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="mb-5">
            <h2 className="text-lg font-bold">Dịch vụ bên trong complex</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Chỉ hiển thị các nơi lưu trú, trải nghiệm và dịch vụ thuộc tổ hợp này.
            </p>
          </div>

          {listings.length > 0 ? (
            <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto pr-2">
              {listings.map((item) => {
                const type = getCategoryType(item);
                const image = item.thumbnailUrl || item.image || "/images/placeholder.jpg";
                const name = item.name || item.title || "Dịch vụ GoTravel";
                const rating = item.rating ?? item.averageRating;

                return (
                  <article
                    key={item.id}
                    onClick={() => item.id && router.push(`/${type}/${item.id}/detail`)}
                    className="flex cursor-pointer gap-4 rounded-2xl border border-transparent p-3 transition hover:border-[#dddddd] hover:bg-[#f7f7f7]"
                  >
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7]">
                      <Image
                        unoptimized
                        fill
                        src={image}
                        alt={name}
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="line-clamp-1 text-sm font-bold sm:text-base">{name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#717171]">
                          <span className="rounded-full bg-white px-2 py-0.5">
                            {getCategoryLabel(item)}
                          </span>
                          {item.province && (
                            <span className="rounded-full bg-white px-2 py-0.5">
                              {item.province}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#717171]">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="text-sm">
                          <span className="font-bold">
                            đ{formatMoney(item.price ?? item.basePrice ?? 0)}
                          </span>
                          <span className="text-xs text-[#717171]"> {getUnit(item)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#222222]">
                          <Star className="h-3.5 w-3.5 fill-[#222222]" />
                          <span>{rating ? rating.toFixed(1) : "Mới"}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#dddddd] bg-[#f7f7f7] p-8 text-center text-sm text-[#717171]">
              Chưa có dịch vụ khả dụng trong complex này.
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
