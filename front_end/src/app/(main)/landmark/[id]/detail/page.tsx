"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlaceServices from "@/services/place";
import { Star, MapPin, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ListingCard({ listing, onClick }: { listing: any; onClick: () => void }) {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-200"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={listing.thumbnailUrl || "/images/placeholder.jpg"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <div className="font-semibold text-gray-800 line-clamp-1 text-sm">
          {listing.title}
        </div>
        <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
          <MapPin size={12} />
          <span className="line-clamp-1">{listing.province}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-purple-600 font-bold text-sm">
            {formatMoney(listing.basePrice ?? 0)}đ
          </div>
          <div className="flex items-center gap-0.5 text-amber-500 text-xs">
            <Star size={12} fill="currentColor" />
            <span>{listing.averageRating ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, onItemClick }: { title: string; items: any[]; onItemClick: (id: string) => void }) {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-bold mb-5 text-gray-800">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

export default function LandmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [landmark, setLandmark] = useState<any>(null);
  const [nearby, setNearby] = useState<any>({ STAY: [], EXP: [], SVC: [] });
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
        const found = landmarksRes?.find((l: any) => l.id === id);
        if (found) setLandmark(found);
        if (nearbyRes) setNearby(nearbyRes);
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
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
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

  const hasAny = nearby.STAY?.length || nearby.EXP?.length || nearby.SVC?.length;

  return (
    <div className="w-full pb-20">
      {/* Banner */}
      <div className="relative w-full h-[55vh] min-h-[380px] overflow-hidden bg-black">
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
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
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
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 space-y-14">
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
  );
}
