"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import OrderService, { type OrderDispute } from "@/services/order";

const unwrapPage = <T,>(res: unknown): T[] => {
  const root = res as { data?: unknown };
  const data = root?.data as { data?: unknown; content?: unknown } | undefined;
  const page = (data?.data ?? data) as { content?: unknown } | undefined;
  return Array.isArray(page?.content) ? (page.content as T[]) : [];
};

const statusMeta = (status?: string) => {
  if (status === "REFUNDED") return { label: "Đã hoàn tiền", icon: RotateCcw, className: "bg-emerald-50 text-emerald-700" };
  if (status === "REJECTED") return { label: "Từ chối", icon: XCircle, className: "bg-red-50 text-red-700" };
  if (status === "RESOLVED") return { label: "Đã xử lý", icon: CheckCircle2, className: "bg-sky-50 text-sky-700" };
  if (status === "IN_REVIEW") return { label: "Đang xem xét", icon: Clock, className: "bg-amber-50 text-amber-700" };
  return { label: "Mới gửi", icon: AlertTriangle, className: "bg-zinc-100 text-zinc-700" };
};

const formatMoney = (value?: number) => Number(value ?? 0).toLocaleString("vi-VN");

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<OrderDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    OrderService.getMyDisputes(0, 100)
      .then((res) => {
        if (!cancelled) setDisputes(unwrapPage<OrderDispute>(res));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được danh sách khiếu nại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-16 pt-10 text-[#222222]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            Tranh chấp & Khiếu nại
          </div>
          <h1 className="mt-3 text-2xl font-bold">Khiếu nại của tôi</h1>
          <p className="mt-1 text-sm text-zinc-500">Theo dõi trạng thái xử lý và phản hồi từ admin.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">Đang tải khiếu nại...</div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>
        ) : disputes.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <h2 className="text-lg font-bold">Chưa có khiếu nại nào</h2>
            <p className="mt-1 text-sm text-zinc-500">Bạn có thể gửi khiếu nại từ trang “Đơn hàng đã hoàn tất”.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => {
              const meta = statusMeta(dispute.status);
              const Icon = meta.icon;
              return (
                <article key={dispute.disputeId} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Mã đơn</p>
                      <h2 className="mt-1 font-mono text-base font-bold">{dispute.orderNumber || dispute.orderId}</h2>
                    </div>
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>
                      <Icon className="h-4 w-4" />
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-2xl bg-zinc-50 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-zinc-500">Lý do</p>
                      <p className="font-semibold">{dispute.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Giá trị đơn</p>
                      <p className="font-semibold">{formatMoney(dispute.orderAmount)} đ</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Ngày gửi</p>
                      <p className="font-semibold">{dispute.createdAt ? new Date(dispute.createdAt).toLocaleString("vi-VN") : "—"}</p>
                    </div>
                  </div>
                  {dispute.description && <p className="mt-4 whitespace-pre-line text-sm text-zinc-600">{dispute.description}</p>}
                  {dispute.adminNote && (
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800">
                      <span className="font-bold">Phản hồi admin: </span>
                      {dispute.adminNote}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
