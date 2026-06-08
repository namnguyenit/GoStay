"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Search, X } from "lucide-react";
import HostService from "@/services/host.service";
import {
  HostOrder,
  formatCurrency,
  formatDate,
  getErrorMessage,
  normalizePage,
  orderStatusClass,
  orderStatusLabel,
  parseDate,
} from "../_utils";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PAYMENT_PENDING", label: "Chờ thanh toán" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

type Feedback = { type: "error"; message: string } | null;

function getOrderId(order: HostOrder) {
  return order.orderNumber || order.orderId || order.id || "—";
}

function getOrderCreatedAt(order: HostOrder) {
  return order.createdAt ?? order.createdDate ?? order.created_at ?? null;
}

function getShortUserId(order: HostOrder) {
  return order.userId ? `${order.userId.slice(0, 8)}...` : "";
}

function getCustomerName(order: HostOrder) {
  return order.customerInfo?.fullName?.trim() || (getShortUserId(order) ? `Khách ${getShortUserId(order)}` : "Khách chưa có tên");
}

function getCustomerPhone(order: HostOrder) {
  return order.customerInfo?.phone?.trim() || "";
}

function getCustomerEmail(order: HostOrder) {
  return order.customerInfo?.email?.trim() || "";
}

export default function HostOrdersPage() {
  const [orders, setOrders] = useState<HostOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<HostOrder | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function fetchOrders() {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await HostService.getHostOrders(0, 300);
      setOrders(normalizePage<HostOrder>(res, 300).content);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Không thể tải danh sách đơn hàng.") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, status, fromDate, toDate]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
    return orders.filter((order) => {
      const created = parseDate(getOrderCreatedAt(order));
      const searchable = [
        order.orderNumber,
        order.orderId,
        order.id,
        getCustomerName(order),
        getCustomerPhone(order),
        getCustomerEmail(order),
        ...(order.items?.map((item) => item.listingTitle) ?? []),
      ].join(" ").toLowerCase();
      const matchKeyword = !keyword || searchable.includes(keyword);
      const matchStatus = status === "ALL" || order.status === status;
      const matchFrom = !from || (created && created >= from);
      const matchTo = !to || (created && created <= to);
      return matchKeyword && matchStatus && matchFrom && matchTo;
    });
  }, [orders, search, status, fromDate, toDate]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Quản lý đơn hàng</h2>
        <p className="text-xs text-gray-600">Tra cứu đơn đặt dịch vụ, khách hàng, ngày đặt và trạng thái thanh toán.</p>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {feedback.message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_170px_170px]">
          <div className="relative">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Tìm kiếm đơn hàng</label>
            <Search className="absolute left-3 top-[calc(50%+10px)] h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã đơn, khách hàng, số điện thoại hoặc dịch vụ..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs font-medium text-gray-900 outline-none focus:border-app-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Trạng thái đơn</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-app-primary">
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Từ ngày tạo</label>
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-gray-700 outline-none focus:border-app-primary" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Đến ngày tạo</label>
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-gray-700 outline-none focus:border-app-primary" />
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">Không có đơn hàng phù hợp với bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-bold">Mã đơn</th>
                  <th className="px-5 py-3 font-bold">Ngày tạo</th>
                  <th className="px-5 py-3 font-bold">Khách hàng</th>
                  <th className="px-5 py-3 font-bold">Dịch vụ</th>
                  <th className="px-5 py-3 text-right font-bold">Tổng tiền</th>
                  <th className="px-5 py-3 text-center font-bold">Trạng thái</th>
                  <th className="px-5 py-3 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((order) => (
                  <tr key={order.orderId || order.id || order.orderNumber} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 font-semibold text-gray-900">{getOrderId(order)}</td>
                    <td className="px-5 py-4 text-gray-700">{formatDate(getOrderCreatedAt(order), true)}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{getCustomerName(order)}</div>
                      <div className="mt-0.5 text-[10px] text-gray-500">{getCustomerPhone(order) || "Chưa có SĐT"}</div>
                      <div className="mt-0.5 max-w-[220px] truncate text-[10px] text-gray-500">{getCustomerEmail(order) || "Chưa có email"}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      <div className="line-clamp-2 max-w-[280px]">
                        {order.items?.map((item) => item.listingTitle).join(", ") || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${orderStatusClass(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(order)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Hiển thị {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length} đơn</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Trước</button>
            <span className="font-bold text-gray-900">Trang {page + 1}/{totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Sau</button>
          </div>
        </div>
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: HostOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Chi tiết đơn {getOrderId(order)}</h3>
            <p className="mt-0.5 text-[10px] text-gray-500">{formatDate(getOrderCreatedAt(order), true)}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5 text-xs">
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Info label="Khách hàng" value={getCustomerName(order)} />
            <Info label="SĐT" value={getCustomerPhone(order) || "Chưa có SĐT"} />
            <Info label="Email" value={getCustomerEmail(order) || "Chưa có email"} />
            <Info label="Tổng tiền" value={formatCurrency(order.totalAmount)} />
          </div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-gray-900">Dịch vụ trong đơn</h4>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${orderStatusClass(order.status)}`}>
              {orderStatusLabel(order.status)}
            </span>
          </div>
          <div className="space-y-2">
            {(order.items ?? []).map((item, index) => (
              <div key={`${item.listingId}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="font-semibold text-gray-900">{item.listingTitle || "—"}</div>
                <div className="mt-1 grid grid-cols-1 gap-2 text-[11px] text-gray-600 sm:grid-cols-3">
                  <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                  <span>Số lượng: {item.quantity ?? "—"}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(item.totalPrice ?? item.unitPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1 break-words font-semibold text-gray-900">{value}</div>
    </div>
  );
}
