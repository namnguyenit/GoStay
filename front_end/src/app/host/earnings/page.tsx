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
          const amount = p.hostAmount || p.amount || 0;
          if (p.status === "PAID") {
            successSum += amount;
          } else if (p.status === "PENDING" || p.status === "REQUESTED") {
            pendingSum += amount;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Doanh thu & Thanh toán</h2>
          <p className="text-xs text-gray-600">Theo dõi doanh thu chi trả thực tế từ GoStay chuyển khoản vào ví của bạn.</p>
        </div>
        <button 
          onClick={async () => {
            try {
              await HostService.requestWithdrawal();
              alert("Yêu cầu rút tiền thành công!");
              fetchPayouts();
            } catch (err: any) {
              alert("Lỗi: Không có khoản thu nhập nào đang chờ rút hoặc lỗi hệ thống.");
            }
          }}
          className="bg-app-primary hover:bg-app-primary/90 text-gray-900 text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-app-primary/20"
        >
          Yêu cầu Rút tiền
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Đã quyết toán</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{totalEarnings.toLocaleString("vi-VN")}đ</h3>
            <p className="text-[9px] text-emerald-600 font-medium mt-1">Đã chuyển khoản thành công</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Đang chờ xử lý</span>
            <div className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600 border border-yellow-200">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{pendingEarnings.toLocaleString("vi-VN")}đ</h3>
            <p className="text-[9px] text-yellow-600 font-medium mt-1">Đang thực hiện chuyển tiền</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Số đợt chi trả</span>
            <div className="p-1.5 bg-app-primary/10 rounded-lg text-app-primary border border-app-primary/20">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{payouts.length} lần</h3>
            <p className="text-[9px] text-gray-500 mt-1">Lịch sử thanh toán tổng cộng</p>
          </div>
        </div>

      </div>

      {/* Payouts Table list */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="w-full">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
               {[1,2,3,4].map(i => <div key={i} className="h-3 w-20 bg-gray-200 animate-shimmer rounded"></div>)}
            </div>
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="w-1/4 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-shimmer rounded"></div>
                  <div className="h-3 w-16 bg-gray-100 animate-shimmer rounded"></div>
                </div>
                <div className="w-1/4"><div className="h-4 w-20 bg-gray-200 animate-shimmer rounded"></div></div>
                <div className="w-1/4"><div className="h-4 w-24 bg-gray-200 animate-shimmer rounded"></div></div>
                <div className="w-1/4 flex justify-end"><div className="h-6 w-24 bg-gray-200 animate-shimmer rounded-full"></div></div>
              </div>
            ))}
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
                <tr className="border-b border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider bg-gray-50">
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
                    <td className="py-4 px-6 text-gray-700">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ ngày"}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-[10px]">
                      {item.id}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div>
                        <p className="font-bold text-gray-900">{item.bankName || "N/A"}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.bankAccount || "N/A"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {(item.hostAmount || item.amount) ? `${(item.hostAmount || item.amount).toLocaleString("vi-VN")}đ` : "0đ"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.status === "PAID" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : item.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-600"
                          : item.status === "REQUESTED"
                          ? "bg-blue-50 text-blue-600 animate-pulse"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {item.status === "PAID" 
                          ? "Đã quyết toán" 
                          : item.status === "PENDING"
                          ? "Đang chờ đối soát"
                          : item.status === "REQUESTED"
                          ? "Đang yêu cầu rút"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-gray-100"
            >
              Trang trước
            </button>
            <span className="text-gray-600">
              Trang <strong className="text-gray-900">{page + 1}</strong> trên <strong className="text-gray-900">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-gray-100"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
