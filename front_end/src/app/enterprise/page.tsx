"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Calendar, DollarSign, Home, PackageCheck, PlusCircle, ShoppingBag } from "lucide-react";
import HostService from "@/services/enterprise.service";
import {
  HostListing,
  HostOrder,
  HostPayout,
  categoryLabel,
  formatCurrency,
  listingStatusClass,
  listingStatusLabel,
  getErrorMessage,
  normalizePage,
  priceUnitLabel,
} from "./_utils";

export default function EnterpriseDashboard() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<HostListing[]>([]);
  const [payouts, setPayouts] = useState<HostPayout[]>([]);
  const [orders, setOrders] = useState<HostOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");
        const [listingsRes, payoutsRes, ordersRes] = await Promise.allSettled([
          HostService.getMyListings(0, 100),
          HostService.getMyPayouts(0, 100),
          HostService.getHostOrders(0, 100),
        ]);

        if (listingsRes.status === "fulfilled") setListings(normalizePage<HostListing>(listingsRes.value, 100).content);
        if (payoutsRes.status === "fulfilled") setPayouts(normalizePage<HostPayout>(payoutsRes.value, 100).content);
        if (ordersRes.status === "fulfilled") setOrders(normalizePage<HostOrder>(ordersRes.value, 100).content);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Không thể tải dữ liệu tổng quan."));
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const summary = useMemo(() => {
    return {
      totalHostAmount: payouts.reduce((sum, payout) => sum + Number(payout.hostAmount ?? payout.amount ?? 0), 0),
      pendingHostAmount: payouts
        .filter((payout) => payout.status === "PENDING" || payout.status === "REQUESTED")
        .reduce((sum, payout) => sum + Number(payout.hostAmount ?? payout.amount ?? 0), 0),
      activeListings: listings.filter((listing) => listing.status === "ACTIVE").length,
      pendingListings: listings.filter((listing) => listing.status === "PENDING").length,
      confirmedOrders: orders.filter((order) => order.status === "CONFIRMED" || order.status === "COMPLETED").length,
    };
  }, [listings, payouts, orders]);

  if (loading) {
    return (
      <div className="space-y-8 animate-smooth-appear">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
              <div className="mt-6 h-7 w-32 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-smooth-appear">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          title="Doanh nghiệp thực nhận"
          value={formatCurrency(summary.totalHostAmount)}
          description={`${formatCurrency(summary.pendingHostAmount)} đang chờ/rút`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <Metric
          title="Dịch vụ hoạt động"
          value={`${summary.activeListings} dịch vụ`}
          description={`${summary.pendingListings} dịch vụ chờ duyệt`}
          icon={<Home className="h-4 w-4" />}
        />
        <Metric
          title="Đơn hàng"
          value={`${orders.length} đơn`}
          description={`${summary.confirmedOrders} đơn đã xác nhận/hoàn tất`}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <Metric
          title="Payout"
          value={`${payouts.length} đợt`}
          description="Lịch sử chi trả từ Payment service"
          icon={<PackageCheck className="h-4 w-4" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Dịch vụ gần đây</h3>
            <Link href="/enterprise/listings" className="flex items-center gap-1 text-[10px] font-semibold text-app-accent hover:underline">
              Quản lý tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                <p className="text-xs text-gray-500">Bạn chưa đăng dịch vụ nào.</p>
                <Link href="/enterprise/listings/new" className="mt-2 inline-block text-xs font-semibold text-app-primary hover:underline">
                  Tạo dịch vụ đầu tiên
                </Link>
              </div>
            ) : (
              listings.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.thumbnailUrl ? (
                      <Image unoptimized src={item.thumbnailUrl} alt={item.title || "listing"} width={48} height={48} className="h-12 w-12 rounded-xl border border-gray-100 object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-[10px] text-gray-500">Ảnh</div>
                    )}
                    <div className="min-w-0">
                      <h4 className="line-clamp-1 text-xs font-bold text-gray-900">{item.title}</h4>
                      <p className="mt-0.5 text-[10px] text-gray-500">{categoryLabel(item.category)} · {item.province || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      {formatCurrency(item.basePrice)}<span className="text-[9px] font-normal text-gray-500">/{priceUnitLabel(item.priceUnit)}</span>
                    </p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${listingStatusClass(item.status)}`}>
                      {listingStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Lối tắt vận hành</h3>
          </div>
          <div className="space-y-3">
            <Shortcut href="/enterprise/calendar" icon={<Calendar className="h-4 w-4" />} title="Lịch nhận khách" description="Xem ngày mở bán, ngày khóa và lượng đặt." />
            <Shortcut href="/enterprise/complexes" icon={<Home className="h-4 w-4" />} title="Khu tổ hợp" description="Quản lý resort/chuỗi và bán kính 3km." />
            <Shortcut href="/enterprise/availability" icon={<PackageCheck className="h-4 w-4" />} title="Khả dụng & sức chứa" description="Cấu hình số phòng/chỗ và khung giờ." />
            <Shortcut href="/enterprise/listings/new" icon={<PlusCircle className="h-4 w-4" />} title="Đăng thêm dịch vụ" description="Tạo lưu trú, trải nghiệm hoặc dịch vụ mới." />
            <Shortcut href="/enterprise/earnings" icon={<DollarSign className="h-4 w-4" />} title="Thu nhập & chi trả" description="Xem payout, hoa hồng và số thực nhận." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, description, icon }: { title: string; value: string; description: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</span>
        <span className="rounded-lg border border-app-primary/20 bg-app-primary/10 p-1.5 text-app-primary">{icon}</span>
      </div>
      <h3 className="mt-4 break-words text-lg font-bold text-gray-900">{value}</h3>
      <p className="mt-1 text-[10px] text-gray-500">{description}</p>
    </div>
  );
}

function Shortcut({ href, icon, title, description }: { href: string; icon: ReactNode; title: string; description: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:bg-gray-50">
      <span className="rounded-lg bg-app-primary/10 p-2 text-app-primary">{icon}</span>
      <span>
        <span className="block text-xs font-bold text-gray-900">{title}</span>
        <span className="mt-0.5 block text-[9px] text-gray-500">{description}</span>
      </span>
    </Link>
  );
}
