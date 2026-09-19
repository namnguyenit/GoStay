import React from "react";
import type { CarKpiMeta } from "../../application/port/car.service.interface";
import { Bus, BedDouble, Crown, Armchair } from "lucide-react";

interface CarKpiCardsProps {
  kpi: CarKpiMeta;
  loading?: boolean;
}

export const CarKpiCards: React.FC<CarKpiCardsProps> = ({ kpi, loading }) => {
  const cards = [
    {
      title: "Tổng số xe",
      count: kpi.totalCars,
      icon: Bus,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      description: "Tất cả xe trong đội",
    },
    {
      title: "Xe giường nằm",
      count: kpi.sleeperCars,
      icon: BedDouble,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      description: "Tiện nghi đường dài",
    },
    {
      title: "Xe Limousine",
      count: kpi.limousineCars,
      icon: Crown,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      description: "Hạng sang cao cấp",
    },
    {
      title: "Xe ghế ngồi",
      count: kpi.seatCars,
      icon: Armchair,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      description: "Tuyến chặng ngắn/trung",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-xl border ${card.borderColor} bg-white p-4 shadow-xs transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {card.title}
              </span>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-2">
              {loading ? (
                <div className="h-7 w-12 animate-pulse rounded bg-gray-200"></div>
              ) : (
                <span className="text-2xl font-bold tracking-tight text-gray-900">
                  {card.count.toLocaleString("vi-VN")}
                </span>
              )}
              <p className="mt-0.5 text-[11px] text-gray-400">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
