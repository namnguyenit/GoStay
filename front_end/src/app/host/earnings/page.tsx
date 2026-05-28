"use client";

import { useEffect, useState } from "react";
import { DollarSign, ArrowUpRight, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import HostService from "@/services/host.service";

export default function HostEarnings() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);

  const size = 6;

  async function fetchPayouts() {
    try {
      setLoading(true);
      const res = await HostService.getMyPayouts(page, size);
      if (res && res.data) {
        const content = res.data.content || res.data || [];
        setPayouts(content);
        if (res.data.totalPages !== undefined) {
          setTotalPages(res.data.totalPages);
        } else {
          setTotalPages(1);
        }

        // Sum overall values for summary cards (based on fetched list)
        let successSum = 0;
        let pendingSum = 0;
        content.forEach((p: any) => {
          if (p.status === "SUCCESS") {
            successSum += p.amount || 0;
          } else if (p.status === "PENDING") {
            pendingSum += p.amount || 0;
          }
        });
        setTotalEarnings(successSum);
        setPendingEarnings(pendingSum);
      }
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayouts();
  }, [page]);

  return (
    <div className="space-y-6 animate-smooth-appear">
      
      {/* Title & Info */}
      <div>
        <h2 className="text-lg font-bold text-white">Doanh thu & Thanh toán</h2>
        <p className="text-xs text-gray-400">Theo dõi doanh thu chi trả thực tế từ GoStay chuyển khoản vào ví của bạn.</p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đã quyết toán</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{totalEarnings.toLocaleString("vi-VN")}đ</h3>
            <p className="text-[9px] text-emerald-400 font-medium mt-1">Đã chuyển khoản thành công</p>
          </div>
        </div>

        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đang chờ xử lý</span>
            <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/10">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{pendingEarnings.toLocaleString("vi-VN")}đ</h3>
            <p className="text-[9px] text-yellow-500 font-medium mt-1">Đang thực hiện chuyển tiền</p>
          </div>
        </div>

        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số đợt chi trả</span>
            <div className="p-1.5 bg-app-primary/10 rounded-lg text-app-primary border border-app-primary/10">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{payouts.length} lần</h3>
            <p className="text-[9px] text-gray-500 mt-1">Lịch sử thanh toán tổng cộng</p>
          </div>
        </div>

      </div>

      {/* Payouts Table list */}
      <div className="bg-[#0d0d18] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs">Đang tải lịch sử thanh toán...</p>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="text-xs">Chưa phát sinh lịch sử quyết toán tiền về ví của bạn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-black/10">
                  <th className="py-4 px-6">Đợt thanh toán</th>
                  <th className="py-4 px-6">Mã giao dịch (Payout ID)</th>
                  <th className="py-4 px-6">Số tài khoản nhận</th>
                  <th className="py-4 px-6">Số tiền nhận</th>
                  <th className="py-4 px-6">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {payouts.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 text-gray-300">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ ngày"}
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono text-[10px]">
                      {item.id}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div>
                        <p className="font-bold text-white">{item.bankName || "N/A"}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.bankAccount || "N/A"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-white">
                      {item.amount ? `${item.amount.toLocaleString("vi-VN")}đ` : "0đ"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.status === "SUCCESS" 
                          ? "bg-emerald-950 text-emerald-400" 
                          : item.status === "PENDING"
                          ? "bg-yellow-950 text-yellow-400"
                          : "bg-red-950 text-red-400"
                      }`}>
                        {item.status === "SUCCESS" 
                          ? "Thành công" 
                          : item.status === "PENDING"
                          ? "Đang chờ xử lý"
                          : "Thất bại"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10 text-xs">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Trang trước
            </button>
            <span className="text-gray-400">
              Trang <strong className="text-white">{page + 1}</strong> trên <strong className="text-white">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
