"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, Clock, Download, ShieldCheck } from "lucide-react";
import HostService from "@/services/host.service";
import {
  HostPayout,
  formatCurrency,
  formatDate,
  getErrorMessage,
  normalizePage,
  parseDate,
  payoutStatusClass,
  payoutStatusLabel,
} from "../_utils";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PAID", label: "Đã chi trả" },
  { value: "PENDING", label: "Chờ đối soát" },
  { value: "REQUESTED", label: "Đã yêu cầu rút" },
  { value: "FAILED", label: "Thất bại" },
];

type Feedback = { type: "success" | "error"; message: string } | null;

export default function HostEarnings() {
  const [payouts, setPayouts] = useState<HostPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function fetchPayouts() {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await HostService.getMyPayouts(0, 300);
      setPayouts(normalizePage<HostPayout>(res, 300).content);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Không thể tải dữ liệu thu nhập.") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayouts();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [status, fromDate, toDate]);

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
    return payouts.filter((item) => {
      const created = parseDate(item.createdAt);
      const matchStatus = status === "ALL" || item.status === status;
      const matchFrom = !from || (created && created >= from);
      const matchTo = !to || (created && created <= to);
      return matchStatus && matchFrom && matchTo;
    });
  }, [payouts, status, fromDate, toDate]);

  const totals = useMemo(() => {
    return filtered.reduce<{
      totalAmount: number;
      commission: number;
      hostAmount: number;
      paid: number;
      pending: number;
    }>(
      (acc, item) => {
        acc.totalAmount += Number(item.totalAmount ?? 0);
        acc.commission += Number(item.commissionAmount ?? 0);
        acc.hostAmount += Number(item.hostAmount ?? item.amount ?? 0);
        if (item.status === "PAID") acc.paid += Number(item.hostAmount ?? item.amount ?? 0);
        if (item.status === "PENDING" || item.status === "REQUESTED") acc.pending += Number(item.hostAmount ?? item.amount ?? 0);
        return acc;
      },
      { totalAmount: 0, commission: 0, hostAmount: 0, paid: 0, pending: 0 }
    );
  }, [filtered]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleWithdraw = async () => {
    try {
      setSubmitting(true);
      setFeedback(null);
      await HostService.requestWithdrawal();
      setFeedback({ type: "success", message: "Đã gửi yêu cầu rút tiền. Admin sẽ xử lý các khoản đủ điều kiện." });
      fetchPayouts();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Không có khoản thu nhập đang chờ rút hoặc hệ thống đang lỗi.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Thu nhập & chi trả</h2>
          <p className="text-xs text-gray-600">
            Theo dõi tổng đơn, hoa hồng nền tảng, số thực nhận và lịch sử payout theo ngày.
          </p>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-app-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-app-primary/20 transition-all hover:bg-app-primary/95 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {submitting ? "Đang gửi..." : "Yêu cầu rút tiền"}
        </button>
      </div>

      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
          feedback.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {feedback.message}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric title="Tổng giá trị đơn" value={formatCurrency(totals.totalAmount)} icon={<ArrowUpRight className="h-4 w-4" />} />
        <Metric title="Hoa hồng nền tảng" value={formatCurrency(totals.commission)} icon={<CalendarDays className="h-4 w-4" />} />
        <Metric title="Host thực nhận" value={formatCurrency(totals.hostAmount)} icon={<ShieldCheck className="h-4 w-4" />} />
        <Metric title="Đang chờ/rút" value={formatCurrency(totals.pending)} icon={<Clock className="h-4 w-4" />} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Trạng thái payout</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-app-primary"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Từ ngày tạo payout</label>
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-gray-700 outline-none focus:border-app-primary" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Đến ngày tạo payout</label>
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
          <div className="p-12 text-center text-xs text-gray-500">Không có payout phù hợp với bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-bold">Ngày tạo</th>
                  <th className="px-5 py-3 font-bold">Ngày chi trả</th>
                  <th className="px-5 py-3 font-bold">Payout ID</th>
                  <th className="px-5 py-3 font-bold">Order ID</th>
                  <th className="px-5 py-3 text-right font-bold">Tổng đơn</th>
                  <th className="px-5 py-3 text-right font-bold">Hoa hồng</th>
                  <th className="px-5 py-3 text-right font-bold">Thực nhận</th>
                  <th className="px-5 py-3 text-center font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((item) => (
                  <tr key={item.payoutId || item.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4 text-gray-700">{formatDate(item.createdAt, true)}</td>
                    <td className="px-5 py-4 text-gray-700">{item.paidAt ? formatDate(item.paidAt, true) : "Chưa chi trả"}</td>
                    <td className="px-5 py-4 font-mono text-[10px] text-gray-600">{item.payoutId || item.id || "—"}</td>
                    <td className="px-5 py-4 font-mono text-[10px] text-gray-600">{item.orderId || "—"}</td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.totalAmount)}</td>
                    <td className="px-5 py-4 text-right text-gray-700">
                      {formatCurrency(item.commissionAmount)}
                      {item.commissionRate !== undefined && <span className="ml-1 text-[10px] text-gray-500">({Number(item.commissionRate) * 100}%)</span>}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-900">{formatCurrency(item.hostAmount ?? item.amount)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${payoutStatusClass(item.status)}`}>
                        {payoutStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Hiển thị {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length} payout</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Trước</button>
            <span className="font-bold text-gray-900">Trang {page + 1}/{totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</span>
        <span className="rounded-lg border border-sky-100 bg-sky-50 p-1.5 text-sky-600">{icon}</span>
      </div>
      <div className="mt-3 break-words text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}
