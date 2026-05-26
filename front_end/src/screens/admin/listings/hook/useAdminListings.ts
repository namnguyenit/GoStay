import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export function useAdminListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<any | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getListings(statusFilter, 0, 100);
      console.log(res?.data);
      setListings(res?.data?.content ?? []);
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    let label = "";
    if (newStatus === "ACTIVE") label = "KÍCH HOẠT";
    if (newStatus === "HIDDEN") label = "TẠM ẨN";
    if (newStatus === "DELETED") label = "XÓA";

    if (!confirm(`Bạn có chắc muốn chuyển dịch vụ này sang trạng thái ${label}?`)) return;

    try {
      await AdminService.changeListingStatus(id, newStatus);
      fetchListings();
      if (selectedListing && selectedListing.id === id) {
        setSelectedListing({ ...selectedListing, status: newStatus });
      }
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      HIDDEN: "bg-amber-100 text-amber-700",
      DELETED: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  return {
    listings,
    loading,
    statusFilter,
    setStatusFilter,
    selectedListing,
    setSelectedListing,
    handleUpdateStatus,
    getStatusBadge,
    refresh: fetchListings
  };
}
