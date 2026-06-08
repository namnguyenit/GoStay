"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw, Search, XCircle } from "lucide-react";
import AdminService, { type AdminApiResponse, type AdminDispute, type AdminDisputeStatus, type AdminPage } from "@/services/admin.service";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";

const PAGE_SIZE = 10;

const statusOptions: Array<{ value: "" | AdminDisputeStatus; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "OPEN", label: "Mới gửi" },
  { value: "IN_REVIEW", label: "Đang xem xét" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "RESOLVED", label: "Đã xử lý" },
  { value: "REJECTED", label: "Từ chối" },
];

const statusMeta = (status?: string) => {
  if (status === "REFUNDED") return { label: "Đã hoàn tiền", icon: RotateCcw, className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (status === "REJECTED") return { label: "Từ chối", icon: XCircle, className: "border-red-200 bg-red-50 text-red-700" };
  if (status === "RESOLVED") return { label: "Đã xử lý", icon: CheckCircle2, className: "border-sky-200 bg-sky-50 text-sky-700" };
  if (status === "IN_REVIEW") return { label: "Đang xem xét", icon: Clock, className: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Mới gửi", icon: AlertTriangle, className: "border-slate-200 bg-slate-50 text-slate-700" };
};

const formatMoney = (value?: number) => Number(value ?? 0).toLocaleString("vi-VN");

const unwrapPage = <T,>(res: AdminApiResponse<AdminPage<T>>): AdminPage<T> => {
  const data = (res?.data as unknown as { data?: AdminPage<T> })?.data ?? res?.data;
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    totalElements: Number(data?.totalElements ?? 0),
    totalPages: Number(data?.totalPages ?? 0),
  };
};

export function AdminDisputesScreen() {
  const [items, setItems] = useState<AdminDispute[]>([]);
  const [status, setStatus] = useState<"" | AdminDisputeStatus>("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<AdminDispute | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const pageData = unwrapPage(await AdminService.getDisputes(status, page, PAGE_SIZE));
      setItems(pageData.content);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không tải được danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) =>
      [item.orderNumber, item.orderId, item.customerName, item.customerEmail, item.reason, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, query]);

  const handleResolve = async (action: "REFUND" | "REJECT" | "RESOLVE") => {
    if (!selected?.disputeId) return;
    setSubmitting(true);
    setFeedback("");
    try {
      await AdminService.resolveDispute(selected.disputeId, action, note.trim() || undefined);
      setSelected(null);
      setNote("");
      setFeedback(action === "REFUND" ? "Đã hoàn tiền và hủy đơn." : "Đã cập nhật trạng thái khiếu nại.");
      await fetchData();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không xử lý được khiếu nại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tranh chấp & Refund</h2>
          <p className="mt-1 text-xs text-slate-500">Admin kiểm tra khiếu nại, từ chối, xử lý hoặc hoàn tiền bắt buộc.</p>
        </div>
        <button onClick={fetchData} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          Làm mới
        </button>
      </div>

      {feedback && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700">{feedback}</div>}

      <div className="flex flex-col gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value || "ALL"}
              onClick={() => {
                setStatus(option.value);
                setPage(0);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${status === option.value ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Lọc trong trang hiện tại..."
            className="w-full rounded-full border border-slate-200 py-2 pl-9 pr-4 text-xs outline-none focus:border-sky-300"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-500">Đơn / Khách</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-500">Nội dung</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-500">Giá trị</th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-5 py-3 text-right font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Không có khiếu nại phù hợp.</td></tr>
              ) : filtered.map((item) => {
                const meta = statusMeta(item.status);
                const Icon = meta.icon;
                return (
                  <tr key={item.disputeId} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-mono font-semibold text-slate-900">{item.orderNumber || item.orderId?.slice(0, 8)}</div>
                      <div className="mt-1 max-w-[240px] truncate text-slate-500">{item.customerName || "Khách"} · {item.customerEmail || "—"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-[360px] font-semibold text-slate-800">{item.reason}</div>
                      <div className="mt-1 max-w-[360px] truncate text-slate-500">{item.description || "Không có mô tả thêm"}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{formatMoney(item.orderAmount)} đ</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.className}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(item)} className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700">
                        Xử lý
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={PAGE_SIZE} loading={loading} onPageChange={setPage} />
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-sky-500/20 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl rounded-[24px] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Xử lý khiếu nại</h3>
            <p className="mt-1 text-xs text-slate-500">Mã đơn: {selected.orderNumber || selected.orderId}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">{selected.reason}</p>
              {selected.description && <p className="mt-2 whitespace-pre-line">{selected.description}</p>}
            </div>
            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">Ghi chú admin</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-sky-300"
              placeholder="Nhập kết luận xử lý hoặc lý do hoàn tiền/từ chối..."
            />
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button disabled={submitting} onClick={() => setSelected(null)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Đóng</button>
              <button disabled={submitting} onClick={() => handleResolve("REJECT")} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">Từ chối</button>
              <button disabled={submitting} onClick={() => handleResolve("RESOLVE")} className="rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100">Đã xử lý</button>
              <button disabled={submitting} onClick={() => handleResolve("REFUND")} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                Hủy đơn & hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
