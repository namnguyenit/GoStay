"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminService, {
  AdminCatalogSummary,
  AdminIdentitySummary,
  AdminOrderSummary,
  AdminPaymentSummary,
  AdminRevenueReport,
  AdminUser,
} from "@/services/admin.service";
import AuthService from "@/services/auth.service";
import { getAdminErrorMessage } from "@/screens/admin/_components/admin-utils";

type DashboardState = {
  identity: AdminIdentitySummary;
  catalog: AdminCatalogSummary;
  orders: AdminOrderSummary;
  payments: AdminPaymentSummary;
  revenue: AdminRevenueReport;
};

const EMPTY_DASHBOARD: DashboardState = {
  identity: {},
  catalog: {},
  orders: {},
  payments: {},
  revenue: {},
};

const numberFormat = new Intl.NumberFormat("vi-VN");
const moneyFormat = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const toNumber = (value?: number) => value ?? 0;
const formatNumber = (value?: number) => numberFormat.format(toNumber(value));
const formatMoney = (value?: number) => moneyFormat.format(toNumber(value));
const percent = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
const shortDate = (value?: string) => {
  if (!value) return "—";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}`;
};

type ChartSegment = {
  label: string;
  value: number;
  color: string;
  href?: string;
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardState>(EMPTY_DASHBOARD);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [identityRes, catalogRes, orderRes, paymentRes, revenueRes, usersRes] = await Promise.all([
          AdminService.getIdentitySummary(),
          AdminService.getCatalogSummary(),
          AdminService.getOrderSummary(),
          AdminService.getPaymentSummary(),
          AdminService.getRevenueReport(),
          AdminService.getUsers(0, 5),
        ]);

        setDashboard({
          identity: identityRes.data ?? {},
          catalog: catalogRes.data ?? {},
          orders: orderRes.data ?? {},
          payments: paymentRes.data ?? {},
          revenue: revenueRes.data ?? {},
        });
        setRecentUsers(usersRes.data?.content ?? []);
      } catch (err) {
        setError(getAdminErrorMessage(err, "Không thể tải dữ liệu dashboard."));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();

    const user = AuthService.getCurrentUser();
    if (user?.username) setAdminName(user.username);
  }, []);

  const statCards = [
    {
      label: "Tài khoản",
      value: formatNumber(dashboard.identity.totalAccounts),
      detail: `${formatNumber(dashboard.identity.activeAccounts)} active • ${formatNumber(dashboard.identity.bannedAccounts)} bị khóa`,
      href: "/admin/users",
      tone: "bg-slate-50 text-slate-700 border-slate-200",
    },
    {
      label: "Hosts",
      value: formatNumber(dashboard.identity.approvedHosts),
      detail: `${formatNumber(dashboard.identity.pendingHosts)} pending • ${formatNumber(dashboard.identity.rejectedHosts)} rejected`,
      href: "/admin/hosts",
      tone: "bg-slate-50 text-slate-700 border-slate-200",
    },
    {
      label: "Listings",
      value: formatNumber(dashboard.catalog.totalListings),
      detail: `${formatNumber(dashboard.catalog.activeListings)} active • ${formatNumber(dashboard.catalog.pendingListings)} pending`,
      href: "/admin/listings",
      tone: "bg-slate-50 text-slate-700 border-slate-200",
    },
    {
      label: "Orders",
      value: formatNumber(dashboard.orders.totalOrders),
      detail: `${formatNumber(dashboard.orders.confirmedOrders)} confirmed • ${formatNumber(dashboard.orders.cancelledOrders)} cancelled`,
      href: "/admin/payouts",
      tone: "bg-slate-50 text-slate-700 border-slate-200",
    },
    {
      label: "Doanh thu",
      value: formatMoney(dashboard.payments.completedPaymentAmount),
      detail: `Commission: ${formatMoney(dashboard.payments.totalCommissionAmount)}`,
      href: "/admin/payouts",
      tone: "bg-slate-50 text-slate-700 border-slate-200",
    },
  ];

  const urgentTasks = [
    { label: "Duyệt Host", count: toNumber(dashboard.identity.pendingHosts), href: "/admin/hosts" },
    { label: "Duyệt Enterprise", count: toNumber(dashboard.identity.pendingEnterprises), href: "/admin/enterprises" },
    { label: "Duyệt Listing", count: toNumber(dashboard.catalog.pendingListings), href: "/admin/listings" },
    { label: "Duyệt Địa danh", count: toNumber(dashboard.catalog.pendingLandmarkSuggestions), href: "/admin/landmarks" },
    { label: "Payout yêu cầu rút", count: toNumber(dashboard.payments.requestedPayouts), href: "/admin/payouts" },
  ];

  const revenueDaily = dashboard.revenue.daily ?? [];
  const recentRevenueDaily = revenueDaily.slice(-14);
  const accountSegments: ChartSegment[] = [
    { label: "Users", value: toNumber(dashboard.identity.totalUsers), color: "#0ea5e9", href: "/admin/users" },
    { label: "Hosts", value: toNumber(dashboard.identity.totalHosts), color: "#22d3ee", href: "/admin/hosts" },
    { label: "Enterprises", value: toNumber(dashboard.identity.totalEnterprises), color: "#bae6fd", href: "/admin/enterprises" },
  ];
  const listingSegments: ChartSegment[] = [
    { label: "Active", value: toNumber(dashboard.catalog.activeListings), color: "#0ea5e9", href: "/admin/listings" },
    { label: "Pending", value: toNumber(dashboard.catalog.pendingListings), color: "#22d3ee", href: "/admin/listings" },
    { label: "Hidden", value: toNumber(dashboard.catalog.hiddenListings), color: "#7dd3fc", href: "/admin/listings" },
    { label: "Deleted", value: toNumber(dashboard.catalog.deletedListings), color: "#bae6fd", href: "/admin/listings" },
  ];
  const paymentSegments: ChartSegment[] = [
    { label: "Completed", value: toNumber(dashboard.payments.completedPayments), color: "#0ea5e9", href: "/admin/payouts" },
    { label: "Pending", value: toNumber(dashboard.payments.pendingPayments), color: "#22d3ee", href: "/admin/payouts" },
    { label: "Expired", value: toNumber(dashboard.payments.expiredPayments), color: "#7dd3fc", href: "/admin/payouts" },
    { label: "Failed", value: toNumber(dashboard.payments.failedPayments), color: "#bae6fd", href: "/admin/payouts" },
  ];
  const orderSegments: ChartSegment[] = [
    { label: "Confirmed", value: toNumber(dashboard.orders.confirmedOrders), color: "#0ea5e9" },
    { label: "Completed", value: toNumber(dashboard.orders.completedOrders), color: "#22d3ee" },
    { label: "Payment pending", value: toNumber(dashboard.orders.paymentPendingOrders), color: "#7dd3fc" },
    { label: "Cancelled", value: toNumber(dashboard.orders.cancelledOrders), color: "#bae6fd" },
  ];

  return (
    <div className="min-w-0 max-w-[1400px] space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Tổng quan hệ thống</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Dữ liệu lấy từ các Admin Summary API thật của Identity, Catalog, Order và Payment.
          </p>
        </div>
        <div className="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          Admin: <span className="text-slate-900">{adminName || "Quản trị viên"}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group min-w-0 rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
          >
            <span className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${card.tone}`}>
              {card.label}
            </span>
            <div className="mt-4 break-words text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-tight text-slate-950 tabular-nums">
              {loading ? "..." : card.value}
            </div>
            <p className="mt-2 break-words text-xs font-medium leading-5 text-slate-500">{card.detail}</p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <ChartShell
          className="xl:col-span-3"
          title="Doanh thu 14 ngày gần nhất"
          description="Gross amount, host payout và commission từ Payment service."
        >
          <RevenueTrendChart data={recentRevenueDaily} loading={loading} />
        </ChartShell>

        <ChartShell
          className="xl:col-span-2"
          title="Cơ cấu tài khoản"
          description="Phân bổ role vận hành chính trong hệ thống."
        >
          <DonutChart segments={accountSegments} centerLabel="Accounts" loading={loading} />
        </ChartShell>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartShell title="Listing health" description="Tỷ lệ dịch vụ theo trạng thái kiểm duyệt.">
          <HorizontalBars segments={listingSegments} loading={loading} />
        </ChartShell>

        <ChartShell title="Payment status" description="Tình trạng payment requests hiện có.">
          <DonutChart segments={paymentSegments} centerLabel="Payments" compact loading={loading} />
        </ChartShell>

        <ChartShell title="Order pipeline" description="Luồng đơn hàng theo trạng thái vận hành.">
          <HorizontalBars segments={orderSegments} loading={loading} />
        </ChartShell>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">Tác vụ cần xử lý</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Count lấy trực tiếp từ các summary endpoint.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {urgentTasks.map((task) => (
              <Link
                key={task.label}
                href={task.href}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-slate-200 hover:bg-white"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{task.label}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">
                    {task.count > 0 ? "Cần admin xử lý" : "Không có việc đang chờ"}
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${task.count > 0 ? "border-slate-300 bg-white text-slate-900" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {loading ? "..." : task.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">Payment / Payout</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Tổng hợp từ Payment service.</p>
          </div>
          <div className="space-y-3 p-5">
            <Metric label="Payment completed" value={formatMoney(dashboard.payments.completedPaymentAmount)} />
            <Metric label="Payout host đã trả" value={formatMoney(dashboard.payments.paidHostAmount)} />
            <Metric label="Payout đang chờ" value={formatMoney(dashboard.payments.pendingHostAmount)} />
            <Metric label="Commission đã trả" value={formatMoney(dashboard.payments.paidCommissionAmount)} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">Revenue report 30 ngày</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Dựa trên payout đã phát sinh trong Payment service, không dùng số demo.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
            <Metric label="Gross amount" value={formatMoney(dashboard.revenue.totalAmount)} />
            <Metric label="Host amount" value={formatMoney(dashboard.revenue.hostAmount)} />
            <Metric label="Commission" value={formatMoney(dashboard.revenue.commissionAmount)} />
          </div>
          <div className="max-h-64 overflow-y-auto border-t border-slate-100 p-5">
            {(dashboard.revenue.daily ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-500">
                Chưa có dữ liệu doanh thu trong khoảng thời gian này.
              </div>
            ) : (
              <div className="space-y-2">
                {(dashboard.revenue.daily ?? []).map((item) => (
                  <div key={item.date} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs">
                    <span className="font-semibold text-slate-700">{item.date}</span>
                    <span className="font-semibold text-slate-950">{formatMoney(item.commissionAmount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">Thành viên mới cập nhật</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">5 tài khoản đầu từ API users.</p>
          </div>
          <div className="divide-y divide-sky-50 p-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="m-2 h-10 rounded bg-slate-50 animate-pulse" />)
            ) : recentUsers.length === 0 ? (
              <div className="p-6 text-center text-xs font-medium text-slate-500">Chưa có dữ liệu người dùng.</div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-2 py-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{user.username || "—"}</div>
                    <div className="mt-0.5 text-slate-500">{user.email || "—"}</div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${user.isActive ? "border-slate-200 bg-slate-50 text-slate-700" : "border-slate-300 bg-white text-slate-500"}`}>
                    {user.isActive ? "Active" : "Banned"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ChartShell({
  title,
  description,
  className = "",
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Live API
        </span>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RevenueTrendChart({
  data,
  loading,
}: {
  data: NonNullable<AdminRevenueReport["daily"]>;
  loading: boolean;
}) {
  if (loading) {
    return <div className="h-[286px] rounded-2xl bg-slate-50 animate-pulse" />;
  }

  if (data.length === 0) {
    return <EmptyChart message="Chưa có dữ liệu doanh thu để vẽ biểu đồ." />;
  }

  const width = 720;
  const height = 260;
  const paddingX = 30;
  const paddingTop = 24;
  const paddingBottom = 34;
  const bottom = height - paddingBottom;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...data.map((item) => toNumber(item.totalAmount)), 1);
  const maxCommission = Math.max(...data.map((item) => toNumber(item.commissionAmount)), 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : paddingX + (index / (data.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - (toNumber(item.totalAmount) / maxValue) * innerHeight;
    return { x, y, item };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${bottom} L ${points[0].x.toFixed(1)} ${bottom} Z`;
  const labelIndexes = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Gross 14 ngày" value={formatMoney(data.reduce((sum, item) => sum + toNumber(item.totalAmount), 0))} />
        <Metric label="Host payout" value={formatMoney(data.reduce((sum, item) => sum + toNumber(item.hostAmount), 0))} />
        <Metric label="Commission" value={formatMoney(data.reduce((sum, item) => sum + toNumber(item.commissionAmount), 0))} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-sky-50/80 to-white p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="Biểu đồ doanh thu 14 ngày gần nhất">
          <defs>
            <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => {
            const y = paddingTop + (line / 3) * innerHeight;
            return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#bae6fd" strokeDasharray="4 8" />;
          })}
          {data.map((item, index) => {
            const barWidth = Math.max(8, innerWidth / data.length / 2.8);
            const x = points[index].x - barWidth / 2;
            const barHeight = (toNumber(item.commissionAmount) / maxCommission) * (innerHeight * 0.58);
            return (
              <rect
                key={item.date ?? index}
                x={x}
                y={bottom - barHeight}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                fill="#67e8f9"
                opacity="0.65"
              />
            );
          })}
          <path d={areaPath} fill="url(#revenueArea)" />
          <path d={linePath} fill="none" stroke="#0ea5e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {points.map((point, index) => (
            <g key={point.item.date ?? index}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#ffffff" stroke="#0ea5e9" strokeWidth="3" />
              {labelIndexes.has(index) && (
                <text x={point.x} y={height - 10} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                  {shortDate(point.item.date)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Gross amount</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-300" /> Commission bars</span>
      </div>
    </div>
  );
}

function DonutChart({
  segments,
  centerLabel,
  compact = false,
  loading,
}: {
  segments: ChartSegment[];
  centerLabel: string;
  compact?: boolean;
  loading: boolean;
}) {
  if (loading) {
    return <div className={`${compact ? "h-[220px]" : "h-[286px]"} rounded-2xl bg-slate-50 animate-pulse`} />;
  }

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let cursor = 0;
  const gradient = total > 0
    ? segments
        .map((segment) => {
          const start = cursor;
          const end = cursor + (segment.value / total) * 100;
          cursor = end;
          return `${segment.color} ${start}% ${end}%`;
        })
        .join(", ")
    : "#bae6fd 0% 100%";

  return (
    <div className={`grid items-center gap-5 ${compact ? "grid-cols-1" : "sm:grid-cols-[180px_1fr]"}`}>
      <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="flex h-[118px] w-[118px] flex-col items-center justify-center rounded-full border border-slate-100 bg-white px-3 text-center shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{centerLabel}</span>
          <span className="mt-1 max-w-full break-words text-[clamp(1rem,4vw,1.5rem)] font-semibold leading-tight text-slate-950 tabular-nums">{formatNumber(total)}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((segment) => (
          <ChartLegendRow key={segment.label} segment={segment} total={total} />
        ))}
      </div>
    </div>
  );
}

function HorizontalBars({ segments, loading }: { segments: ChartSegment[]; loading: boolean }) {
  if (loading) {
    return <div className="h-[220px] rounded-2xl bg-slate-50 animate-pulse" />;
  }

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) {
    return <EmptyChart message="Chưa có dữ liệu trạng thái để hiển thị." compact />;
  }

  return (
    <div className="space-y-3">
      {segments.map((segment) => {
        const width = percent(segment.value, total);
        return (
          <div key={segment.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{segment.label}</span>
              <span className="font-bold text-slate-950">{formatNumber(segment.value)} · {width}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, backgroundColor: segment.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartLegendRow({ segment, total }: { segment: ChartSegment; total: number }) {
  const content = (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition-colors hover:bg-white">
      <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-700">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
        <span className="truncate">{segment.label}</span>
      </span>
      <span className="shrink-0 text-xs font-bold text-slate-950 tabular-nums">
        {formatNumber(segment.value)} · {percent(segment.value, total)}%
      </span>
    </div>
  );

  if (!segment.href) return content;
  return <Link href={segment.href}>{content}</Link>;
}

function EmptyChart({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={`flex ${compact ? "h-[180px]" : "h-[286px]"} items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs font-semibold text-slate-500`}>
      {message}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold leading-tight text-slate-950 tabular-nums">{value}</div>
    </div>
  );
}
