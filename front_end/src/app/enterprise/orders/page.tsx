"use client";

import { useEffect, useState } from "react";
import HostService from "@/services/host.service";
import { format } from "date-fns";

export default function HostOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await HostService.getHostOrders();
      if (res && res.content) {
        setOrders(res.content);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch host orders", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PAYMENT_PENDING":
        return "bg-yellow-50 text-yellow-600";
      case "CONFIRMED":
        return "bg-green-500/20 text-green-500";
      case "CANCELLED":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Quản lý Đơn hàng</h2>
        <p className="text-xs text-gray-600">Xem danh sách khách hàng đã đặt phòng hoặc dịch vụ của bạn.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-600 text-sm">
            Bạn chưa có đơn đặt phòng nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Mã Đơn</th>
                  <th className="p-4 font-semibold">Ngày Tạo</th>
                  <th className="p-4 font-semibold">Khách Hàng</th>
                  <th className="p-4 font-semibold">Dịch Vụ</th>
                  <th className="p-4 font-semibold">Tổng Tiền</th>
                  <th className="p-4 font-semibold text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors text-sm text-gray-200">
                    <td className="p-4 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="p-4">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</td>
                    <td className="p-4">
                      {order.customerInfo?.fullName || "Khách"} <br />
                      <span className="text-xs text-gray-600">{order.customerInfo?.phone || ""}</span>
                    </td>
                    <td className="p-4">
                      <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                        {order.items?.map((item: any, i: number) => (
                          <li key={i}>{item.listingTitle} ({format(new Date(item.startDate), "dd/MM")} - {format(new Date(item.endDate), "dd/MM")})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-semibold text-app-primary">
                      {order.totalAmount?.toLocaleString()}đ
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
