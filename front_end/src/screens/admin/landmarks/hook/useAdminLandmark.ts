import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

type Tab = "suggestions" | "create" | "showlandmarks";
type StatusTab = "PENDING" | "RESOLVED" | "REJECTED";

export function useAdminLandmark() {
  const [tab, setTab] = useState<Tab>("suggestions");
  const [statusTab, setStatusTab] = useState<StatusTab>("PENDING");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    province: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Official Landmarks state
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState<any>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getLandmarkSuggestions(statusTab, 0, 100);
      console.log("Fetched suggestions:", res?.data?.content ?? []);
      setSuggestions(res?.data?.content ?? []);
    } catch (err) {
      console.error("Failed to load suggestions", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await AdminService.getLandmarkSuggestions("PENDING", 0, 1);
      console.log("Fetched pending count:", res?.data?.content ?? []);
      setPendingCount(res?.data?.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  const fetchLandmarks = async () => {
    setLoadingLandmarks(true);
    try {
      const res = await AdminService.getLandmarks(undefined, 0, 100);
      console.log("Fetched landmarks:", res?.data?.content ?? []);
      setLandmarks(res?.data?.content ?? []);
    } catch (err) {
      console.error("Failed to load official landmarks", err);
    } finally {
      setLoadingLandmarks(false);
    }
  };

  useEffect(() => {
    if (tab === "suggestions") {
      fetchSuggestions();
      fetchPendingCount();
    } else if (tab === "showlandmarks") {
      fetchLandmarks();
    }
  }, [tab, statusTab]);

  const handleUpdateStatus = async (id: string, status: "RESOLVED" | "REJECTED") => {
    const label = status === "RESOLVED" ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (!confirm(`Bạn có chắc muốn ${label} đề xuất này?`)) return;
    try {
      await AdminService.updateLandmarkSuggestionStatus(id, status);
      fetchSuggestions();
      fetchPendingCount();
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.latitude || !form.longitude || !form.province) {
      alert("Vui lòng điền đủ Tên, Tỉnh/Thành phố, Vĩ độ và Kinh độ.");
      return;
    }
    setSubmitting(true);
    try {
      await AdminService.createLandmark({
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        province: form.province,
      });
      setSuccessMsg(`Đã tạo địa danh "${form.name}" thành công!`);
      setForm({ name: "", description: "", latitude: "", longitude: "", province: "" });
    } catch (err) {
      alert("Có lỗi khi tạo địa danh.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLandmarkStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    const label = nextStatus === "ACTIVE" ? "HOẠT ĐỘNG" : "ẨN";
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái địa danh này thành ${label}?`)) return;
    try {
      await AdminService.changeLandmarkStatus(id, nextStatus);
      fetchLandmarks();
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const handleStartEdit = (landmark: any) => {
    setEditingLandmark({
      id: landmark.id,
      name: landmark.name,
      description: landmark.description,
      latitude: landmark.latitude.toString(),
      longitude: landmark.longitude.toString(),
      province: landmark.province,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLandmark.name || !editingLandmark.latitude || !editingLandmark.longitude || !editingLandmark.province) {
      alert("Vui lòng điền đủ Tên, Tỉnh/Thành phố, Vĩ độ và Kinh độ.");
      return;
    }
    try {
      await AdminService.updateLandmark(editingLandmark.id, {
        name: editingLandmark.name,
        description: editingLandmark.description,
        latitude: parseFloat(editingLandmark.latitude),
        longitude: parseFloat(editingLandmark.longitude),
        province: editingLandmark.province,
      });
      alert("Cập nhật địa danh thành công!");
      setEditingLandmark(null);
      fetchLandmarks();
    } catch {
      alert("Có lỗi xảy ra khi cập nhật địa danh.");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      RESOLVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  return {
    tab,
    setTab,
    statusTab,
    setStatusTab,
    suggestions,
    loading,
    handleUpdateStatus,
    form,
    setForm,
    handleCreate,
    submitting,
    successMsg,
    statusBadge,
    pendingCount, 
    landmarks,
    loadingLandmarks,
    editingLandmark,
    setEditingLandmark,
    handleUpdateLandmarkStatus,
    handleStartEdit,
    handleSaveEdit
  };
}