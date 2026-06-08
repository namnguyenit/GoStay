"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlaceServices from "@/services/place";
import { Star, MapPin, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LandmarkDetail = {
  id?: string;
  name?: string;
  description?: string;
  province?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
};

type NearbyListing = {
  id: string;
  title?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  imageUrls?: string[];
  images?: string[];
  province?: string;
  basePrice?: number;
  averageRating?: number;
};

type NearbyComplex = {
  id: string;
  name?: string;
  thumbnailUrl?: string;
  image?: string;
  galleryUrls?: string[];
  imageUrls?: string[];
  images?: string[];
  province?: string;
  listingCount?: number;
  distanceMeters?: number;
};

type NearbyState = {
  STAY: NearbyListing[];
  EXP: NearbyListing[];
  SVC: NearbyListing[];
  COMPLEX: NearbyComplex[];
};

function CardImageCarousel({ images, alt }: { images: Array<string | undefined>; alt?: string }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageList = React.useMemo(
    () => Array.from(new Set(images.filter((url): url is string => Boolean(url?.trim())))),
    [images],
  );
  const safeImageIndex = imageList.length > 0 ? Math.min(imageIndex, imageList.length - 1) : 0;
  const image = imageList[safeImageIndex] ?? "/images/placeholder.jpg";
  const hasMultipleImages = imageList.length > 1;
  const dotCount = Math.min(imageList.length, 4);

  const moveImage = (direction: "prev" | "next") => {
    if (!hasMultipleImages) return;
    setImageIndex((current) => {
      const next = direction === "next" ? current + 1 : current - 1;
      return (next + imageList.length) % imageList.length;
    });
  };

  return (
    <div className="relative aspect-[20/19] w-full overflow-hidden rounded-xl bg-[#f7f7f7]">
      <img
        src={image}
        alt={alt || "Hình ảnh dịch vụ"}
        className="h-full w-full object-cover transition-[filter,transform] duration-200 group-hover:scale-[1.015] group-hover:contrast-105"
      />
      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              moveImage("prev");
            }}
            className="absolute left-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#222222] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 md:flex"
            aria-label="Hình ảnh trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              moveImage("next");
            }}
            className="absolute right-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#222222] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 md:flex"
            aria-label="Hình ảnh tiếp theo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {Array.from({ length: dotCount }).map((_, index) => {
              const isActive = index === Math.min(safeImageIndex, dotCount - 1);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive ? "w-3 bg-white" : "w-1.5 bg-white/55"
                  }`}
                  aria-label={`Xem ảnh ${index + 1}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ListingCard({ listing, onClick }: { listing: NearbyListing; onClick: () => void }) {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer"
    >
      <CardImageCarousel
        images={[
          listing.thumbnailUrl,
          ...(listing.galleryUrls ?? []),
          ...(listing.imageUrls ?? []),
          ...(listing.images ?? []),
        ]}
        alt={listing.title}
      />
      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-[19px] text-[#222222] group-hover:underline">
            {listing.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-sm leading-[18px] text-[#222222]">
            <Star size={14} fill="currentColor" />
            <span>{Number(listing.averageRating ?? 0).toFixed(1).replace(".", ",")}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[15px] font-normal leading-[19px] text-[#717171]">
          <MapPin size={13} />
          <span className="line-clamp-1">{listing.province}</span>
        </div>
        <p className="line-clamp-1 text-[15px] leading-[19px] text-[#222222]">
          <span className="font-semibold">{formatMoney(listing.basePrice ?? 0)} ₫</span>
          <span className="font-normal"> / dịch vụ</span>
        </p>
      </div>
    </article>
  );
}

function ComplexCard({ complex, onClick }: { complex: NearbyComplex; onClick: () => void }) {
  const distanceKm =
    typeof complex.distanceMeters === "number"
      ? `${(complex.distanceMeters / 1000).toFixed(1)}km`
      : null;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer"
    >
      <CardImageCarousel
        images={[
          complex.thumbnailUrl,
          complex.image,
          ...(complex.galleryUrls ?? []),
          ...(complex.imageUrls ?? []),
          ...(complex.images ?? []),
        ]}
        alt={complex.name}
      />
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-[19px] text-[#222222] group-hover:underline">
          {complex.name}
        </h3>
        <div className="flex items-center gap-1 text-[15px] font-normal leading-[19px] text-[#717171]">
          <MapPin size={13} />
          <span className="line-clamp-1">{complex.province || "Việt Nam"}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-[#717171]">
          {distanceKm && (
            <span className="rounded-full bg-[#f7f7f7] px-2.5 py-1">
              Cách {distanceKm}
            </span>
          )}
          {complex.listingCount ? (
            <span className="rounded-full bg-[#f7f7f7] px-2.5 py-1">
              {complex.listingCount} dịch vụ
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Section({ title, items, onItemClick }: { title: string; items: NearbyListing[]; onItemClick: (id: string) => void }) {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-[#222222]">{title}</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onClick={() => onItemClick(listing.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ComplexSection({ title, items, onItemClick }: { title: string; items: NearbyComplex[]; onItemClick: (item: NearbyComplex) => void }) {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-[#222222]">{title}</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((complex) => (
          <ComplexCard
            key={complex.id}
            complex={complex}
            onClick={() => onItemClick(complex)}
          />
        ))}
      </div>
    </section>
  );
}

export default function LandmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [landmark, setLandmark] = useState<LandmarkDetail | null>(null);
  const [nearby, setNearby] = useState<NearbyState>({ STAY: [], EXP: [], SVC: [], COMPLEX: [] });
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  const images = [landmark?.thumbnailUrl, ...(landmark?.galleryUrls || [])].filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [landmarksRes, nearbyRes] = await Promise.all([
          PlaceServices.getLandmarks(),
          PlaceServices.getNearbyListings(id, 5000),
        ]);
        const found = (landmarksRes as LandmarkDetail[])?.find((l) => l.id === id);
        if (found) setLandmark(found);
        if (nearbyRes) {
          setNearby({
            STAY: nearbyRes.STAY ?? [],
            EXP: nearbyRes.EXP ?? [],
            SVC: nearbyRes.SVC ?? [],
            COMPLEX: nearbyRes.COMPLEX ?? [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff385c] border-t-transparent" />
          <span className="text-gray-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!landmark) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <span className="text-gray-500">Không tìm thấy địa danh</span>
      </div>
    );
  }

  const hasAny = nearby.STAY?.length || nearby.EXP?.length || nearby.SVC?.length || nearby.COMPLEX?.length;

  return (
    <div className="w-full pb-20">
      {/* Banner */}
      <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-black">
        {images.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={images[imageIndex]}
                alt={landmark.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <img
            src="/images/placeholder.jpg"
            alt={landmark?.name || "Placeholder"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow">
            {landmark.name}
          </h1>
          {landmark.description && (
            <p className="text-base text-white/85 max-w-2xl line-clamp-2">
              {landmark.description}
            </p>
          )}
          {landmark.province && (
            <div className="flex items-center gap-1.5 mt-2 text-white/70 text-sm">
              <MapPin size={14} />
              <span>{landmark.province}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <button
          onClick={() => router.back()}
          className="group mb-10 flex items-center gap-2 text-[#717171] transition hover:text-[#222222]"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-base font-medium">Quay lại</span>
        </button>

        <div className="space-y-14">
          <Section
            title="🏨 Khách sạn lân cận (5km)"
          items={nearby.STAY ?? []}
          onItemClick={(id) => router.push(`/place/${id}/detail`)}
        />
        <Section
          title="🎒 Trải nghiệm quanh đây"
          items={nearby.EXP ?? []}
          onItemClick={(id) => router.push(`/experience/${id}/detail`)}
        />
        <Section
          title="🍜 Dịch vụ tiện ích"
          items={nearby.SVC ?? []}
          onItemClick={(id) => router.push(`/service/${id}/detail`)}
        />
        <ComplexSection
          title="🏝️ Khu du lịch quanh đây (5km)"
          items={nearby.COMPLEX ?? []}
          onItemClick={(complex) => {
            if (!complex?.id) return;
            router.push(`/complex/${complex.id}/detail`);
          }}
        />

        {!hasAny && (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🗺️</div>
            <div className="text-lg font-medium">
              Không tìm thấy dịch vụ nào trong bán kính 5km.
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
