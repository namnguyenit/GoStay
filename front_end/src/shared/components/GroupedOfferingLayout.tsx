"use client";

import { useRouter } from "next/navigation";
import { CarouselSection, OfferingCarouselItem } from "@/shared/components";

interface GroupedOfferingLayoutProps {
  items: any[];
  type: "place" | "experience" | "service";
  titlePrefix: string;
}

export default function GroupedOfferingLayout({ items, type, titlePrefix }: GroupedOfferingLayoutProps) {
  const router = useRouter();

  const groupItemsByProvince = (itemList: any[]) => {
    if (!itemList) return [];
    const groups: Record<string, any[]> = {};
    itemList.forEach(p => {
      const parts = p.address?.split(",") || [];
      const province = (parts[parts.length - 1] || p.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(p);
    });
    
    return Object.entries(groups)
      .map(([name, list]) => {
        const maxRating = Math.max(...list.map(x => x.rating || 0));
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return { name, list, maxRating };
      })
      .sort((a, b) => b.maxRating - a.maxRating)
      .slice(0, 4); // Lấy top 4 theo yêu cầu
  };

  const topGroups = groupItemsByProvince(items);

  if (topGroups.length === 0) {
    return <div className="p-8 text-center text-app-muted-fg mt-20">Không có dữ liệu.</div>;
  }

  return (
    <div className="pt-24 pb-20 w-full min-h-screen">
      {topGroups.map((group) => (
        <div key={group.name}>
          <CarouselSection title={`${titlePrefix} ${group.name}`}>
            {group.list.map((e: any) => (
              <OfferingCarouselItem
                key={e?.id}
                item={e}
                onSelect={(item) => {
                  if (item?.id) router.push(`/${type}/${item.id}/detail`);
                }}
              />
            ))}
          </CarouselSection>
          <div className="h-10" />
        </div>
      ))}
    </div>
  );
}
