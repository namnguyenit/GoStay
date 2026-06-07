"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CalendarDays, CheckCircle2, QrCode, TicketCheck, X } from "lucide-react";
import OrderService from "@/services/order";

type CompletedOrderItem = {
  itemId?: string;
  listingId?: string;
  listingTitle?: string;
  thumbnailUrl?: string;
  startDate?: string;
  endDate?: string;
  timeSlot?: string;
  quantity?: number;
  totalPrice?: number;
};

type CompletedOrder = {
  orderId?: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  customerInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  items?: CompletedOrderItem[];
};

const unwrapOrders = (res: unknown): CompletedOrder[] => {
  const root = res as { data?: unknown };
  const data = root?.data as { data?: unknown; content?: unknown } | undefined;
  const page = (data?.data ?? data) as { content?: unknown } | undefined;
  return Array.isArray(page?.content) ? (page.content as CompletedOrder[]) : [];
};

const formatMoney = (value?: number) =>
  Number(value ?? 0).toLocaleString("vi-VN");

function TicketQr({ value }: { value: string }) {
  const cells = Array.from({ length: 121 }, (_, index) => {
    const seed = `${value}:${index}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const row = Math.floor(index / 11);
    const col = index % 11;
    const inCorner =
      (row < 3 && col < 3) ||
      (row < 3 && col > 7) ||
      (row > 7 && col < 3);
    return inCorner || hash % 3 === 0;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
      <div className="grid grid-cols-11 gap-0.5">
        {cells.map((filled, index) => (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-[2px] ${filled ? "bg-zinc-950" : "bg-zinc-100"}`}
          />
        ))}
      </div>
    </div>
  );
}

function CompletedOrdersContent() {
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get("orderId");
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState<CompletedOrder | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    OrderService.getUserOrders(0, 100)
      .then((res) => {
        if (cancelled) return;
        setOrders(unwrapOrders(res));
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được danh sách đơn hàng hoàn tất.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const completedOrders = useMemo(() => {
    const filtered = orders.filter((order) =>
      ["CONFIRMED", "COMPLETED"].includes(String(order.status ?? "").toUpperCase()),
    );

    if (!highlightedOrderId) return filtered;

    return [...filtered].sort((a, b) => {
      if (a.orderId === highlightedOrderId) return -1;
      if (b.orderId === highlightedOrderId) return 1;
      return 0;
    });
  }, [highlightedOrderId, orders]);

  const submitDispute = async () => {
    if (!selectedDisputeOrder?.orderId) return;
    if (!disputeReason.trim()) {
      setDisputeMessage("Vui lòng nhập lý do khiếu nại.");
      return;
    }

    setDisputeLoading(true);
    setDisputeMessage("");
    try {
      await OrderService.createDispute({
        orderId: selectedDisputeOrder.orderId,
        reason: disputeReason.trim(),
        description: disputeDescription.trim() || undefined,
      });
      setDisputeMessage("Đã gửi khiếu nại. Admin sẽ kiểm tra và phản hồi.");
      setDisputeReason("");
      setDisputeDescription("");
      setSelectedDisputeOrder(null);
    } catch (error) {
      setDisputeMessage(error instanceof Error ? error.message : "Không gửi được khiếu nại.");
    } finally {
      setDisputeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-16 pt-10 text-[#222222]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <TicketCheck className="h-4 w-4" />
                Vé check-in
              </div>
              <h1 className="text-2xl font-bold">Đơn hàng đã hoàn tất</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Xuất trình mã vé này khi đến nơi để chủ nhà/doanh nghiệp đối soát.
              </p>
            </div>
            <QrCode className="hidden h-12 w-12 text-zinc-300 sm:block" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">
            Đang tải vé của bạn...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : completedOrders.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <TicketCheck className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <h2 className="text-lg font-bold">Chưa có đơn hàng hoàn tất</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Sau khi thanh toán thành công, vé check-in sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {disputeMessage && (
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                {disputeMessage}
              </div>
            )}
            {completedOrders.map((order) => {
              const ticketCode = order.orderNumber || order.orderId || "GOSTAY";
              return (
                <article
                  key={order.orderId}
                  className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-zinc-200"
                >
                  <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
                    <div className="p-5 sm:p-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            Mã đơn
                          </p>
                          <h2 className="mt-1 font-mono text-lg font-bold">
                            {ticketCode}
                          </h2>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          {order.status === "COMPLETED" ? "Hoàn tất" : "Đã xác nhận"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDisputeOrder(order);
                            setDisputeMessage("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Khiếu nại
                        </button>
                      </div>

                      <div className="mb-5 grid gap-3 rounded-2xl bg-zinc-50 p-4 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-zinc-500">Khách hàng</p>
                          <p className="font-semibold">{order.customerInfo?.fullName || "Chưa có tên"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Liên hệ</p>
                          <p className="font-semibold">{order.customerInfo?.phone || order.customerInfo?.email || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Tổng thanh toán</p>
                          <p className="font-bold text-rose-600">{formatMoney(order.totalAmount)} đ</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(order.items ?? []).map((item) => (
                          <div key={item.itemId} className="flex gap-3 rounded-2xl border border-zinc-100 p-3">
                            <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                              {item.thumbnailUrl ? (
                                <Image
                                  unoptimized
                                  fill
                                  src={item.thumbnailUrl}
                                  alt={item.listingTitle || "Dịch vụ"}
                                  className="object-cover"
                                  sizes="96px"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-xs font-bold text-zinc-400">
                                  GoStay
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 font-semibold">{item.listingTitle}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {item.startDate} - {item.endDate}
                              </p>
                              {item.timeSlot && (
                                <p className="mt-0.5 text-xs text-zinc-500">Khung giờ: {item.timeSlot}</p>
                              )}
                              <p className="mt-0.5 text-xs text-zinc-500">Số lượng: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <aside className="flex flex-col items-center justify-center gap-3 border-t border-dashed border-zinc-200 bg-zinc-50 p-6 lg:border-l lg:border-t-0">
                      <TicketQr value={ticketCode} />
                      <p className="text-center text-xs font-semibold text-zinc-500">
                        Mã check-in
                      </p>
                      <p className="break-all text-center font-mono text-xs text-zinc-700">
                        {ticketCode}
                      </p>
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedDisputeOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-rose-500/20 backdrop-blur-sm" onClick={() => setSelectedDisputeOrder(null)} />
          <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setSelectedDisputeOrder(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              Gửi khiếu nại
            </div>
            <h2 className="text-xl font-bold">Báo cáo vấn đề đơn hàng</h2>
            <p className="mt-1 text-sm text-zinc-500">Mã đơn: {selectedDisputeOrder.orderNumber || selectedDisputeOrder.orderId}</p>

            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Lý do *</label>
            <input
              value={disputeReason}
              onChange={(event) => setDisputeReason(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-300"
              placeholder="VD: Không có phòng khi đến nơi"
            />
            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-zinc-500">Mô tả chi tiết</label>
            <textarea
              value={disputeDescription}
              onChange={(event) => setDisputeDescription(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-zinc-200 p-4 text-sm outline-none focus:border-rose-300"
              placeholder="Mô tả sự việc, bằng chứng, yêu cầu hoàn tiền..."
            />
            <button
              type="button"
              onClick={submitDispute}
              disabled={disputeLoading}
              className="mt-5 w-full rounded-2xl bg-[#ff385c] px-5 py-3 text-sm font-bold text-white hover:bg-[#e61e4d] disabled:opacity-60"
            >
              {disputeLoading ? "Đang gửi..." : "Gửi khiếu nại"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompletedOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 pt-24 text-center">Đang tải...</div>}>
      <CompletedOrdersContent />
    </Suspense>
  );
}
