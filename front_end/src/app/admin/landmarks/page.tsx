"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export default function AdminLandmarksPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch landmark suggestions
      const res = await AdminService.getLandmarkSuggestions(0, 50);
      if (res && res.data && res.data.content) {
        setSuggestions(res.data.content);
      }
    } catch (error) {
      console.error("Failed to fetch landmark suggestions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    const actionName = status === "APPROVED" ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (confirm(`Bạn có chắc chắn muốn ${actionName} đề xuất địa danh này?`)) {
      try {
        await AdminService.updateLandmarkSuggestionStatus(id, status);
        fetchSuggestions(); // Refresh after action
      } catch (error) {
        console.error("Failed to update suggestion status", error);
        alert("Có lỗi xảy ra khi thực hiện thao tác.");
      }
    }
  };

  if (loading) {
    return <div>Đang tải danh sách đề xuất địa danh...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý Đề xuất Địa danh</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Tên Địa danh</th>
              <th className="p-4 font-semibold text-gray-600">Mô tả</th>
              <th className="p-4 font-semibold text-gray-600">Tọa độ (Lat/Lng)</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suggestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có đề xuất nào chờ duyệt.
                </td>
              </tr>
            ) : (
              suggestions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xs">{item.description}</td>
                  <td className="p-4 text-gray-600">
                    {item.latitude}, {item.longitude}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {item.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                          className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                          className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
