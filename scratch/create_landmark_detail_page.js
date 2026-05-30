const fs = require('fs');
const path = require('path');

const dirPath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/(main)/landmark/[id]/detail';
fs.mkdirSync(dirPath, { recursive: true });

const pagePath = path.join(dirPath, 'page.tsx');

const pageContent = `"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { placeService } from "@/services/place";
import ListingCard from "@/features/place/components/ListingCard";

export default function LandmarkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [landmark, setLandmark] = useState<any>(null);
  const [nearby, setNearby] = useState<any>({ STAY: [], EXPERIENCE: [], SVC: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [landmarksRes, nearbyRes] = await Promise.all([
          placeService.getLandmarks(),
          placeService.getNearbyListings(id, 5000)
        ]);
        const found = landmarksRes?.data?.find((l: any) => l.id === id);
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

  if (loading) return <div className="h-screen w-full flex items-center justify-center">Đang tải...</div>;
  if (!landmark) return <div className="h-screen w-full flex items-center justify-center">Không tìm thấy địa danh</div>;

  return (
    <div className="w-full pb-20">
      {/* Banner */}
      <div className="relative w-full h-[50vh] min-h-[400px]">
        <Image src={landmark.thumbnailUrl || "/images/placeholder.jpg"} alt={landmark.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{landmark.name}</h1>
          <p className="text-lg text-white/90 max-w-2xl">{landmark.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 space-y-16">
        {/* Khách sạn lân cận */}
        {nearby.STAY?.length > 0 && (
          <section>
            <h2 className="text-3xl font-semibold mb-6">Khách sạn lân cận (Bán kính 5km)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nearby.STAY.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Trải nghiệm */}
        {nearby.EXPERIENCE?.length > 0 && (
          <section>
            <h2 className="text-3xl font-semibold mb-6">Trải nghiệm quanh đây</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nearby.EXPERIENCE.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Dịch vụ */}
        {nearby.SVC?.length > 0 && (
          <section>
            <h2 className="text-3xl font-semibold mb-6">Dịch vụ tiện ích</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nearby.SVC.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {(!nearby.STAY?.length && !nearby.EXPERIENCE?.length && !nearby.SVC?.length) && (
          <div className="text-center text-gray-500 py-20 text-lg">
            Không tìm thấy dịch vụ nào trong bán kính 5km.
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(pagePath, pageContent);
console.log("Landmark Detail Page created");
