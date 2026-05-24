"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

type Tab = "suggestions" | "create";

export default function AdminLandmarksPage() {
  const [tab, setTab] = useState<Tab>("suggestions");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getLandmarkSuggestions(0, 100);
      setSuggestions(res?.data?.content ?? []);
    } catch (err) {
      console.error("Failed to load suggestions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const label = status === "APPROVED" ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (!confirm(`Bạn có chắc muốn ${label} đề xuất này?`)) return;
    try {
      await AdminService.updateLandmarkSuggestionStatus(id, status);
      fetchSuggestions();
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.latitude || !form.longitude) {
      alert("Vui lòng điền đủ Tên, Vĩ độ và Kinh độ.");
      return;
    }
    setSubmitting(true);
    try {
      await AdminService.createLandmark({
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        address: form.address,
      });
      setSuccessMsg(`Đã tạo địa danh "${form.name}" thành công!`);
      setForm({ name: "", description: "", latitude: "", longitude: "", address: "" });
    } catch (err) {
      alert("Có lỗi khi tạo địa danh.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  const pendingCount = suggestions.filter((s) => s.status === "PENDING").length;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Địa danh</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        <button
          onClick={() => setTab("suggestions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "suggestions"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Đề xuất {pendingCount > 0 && `(${pendingCount} chờ duyệt)`}
        </button>
        <button
          onClick={() => setTab("create")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "create"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ➕ Thêm địa danh mới
        </button>
      </div>

      {/* Suggestions Tab */}
      {tab === "suggestions" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mô tả</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tọa độ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : suggestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Không có đề xuất nào.
                  </td>
                </tr>
              ) : (
                suggestions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.latitude}, {item.longitude}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                            className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Tab */}
      {tab === "create" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Thêm địa danh mới</h3>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên địa danh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Hồ Hoàn Kiếm"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn về địa danh..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vĩ độ (Latitude) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="21.0285"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kinh độ (Longitude) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="105.8542"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="VD: Hàng Trống, Hoàn Kiếm, Hà Nội"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Đang tạo..." : "Tạo địa danh"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
