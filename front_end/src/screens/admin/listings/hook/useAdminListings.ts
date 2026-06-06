import { useEffect, useMemo, useState } from "react";
import AdminService, { AdminListing, ListingStatus } from "@/services/admin.service";
import {
  ConfirmState,
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminErrorMessage,
} from "@/screens/admin/_components/admin-utils";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function useAdminListings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setRawStatusFilter] = useState<ListingStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const setStatusFilter = (nextStatus: ListingStatus | "") => {
    setRawStatusFilter(nextStatus);
    setPage(0);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getListings(statusFilter, page, DEFAULT_ADMIN_PAGE_SIZE);
      setListings(res?.data?.content ?? []);
      setTotalPages(Math.max(res?.data?.totalPages ?? 1, 1));
      setTotalElements(res?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách dịch vụ."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter, page]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;

    return listings.filter((item) => {
      return (
        item.title?.toLowerCase().includes(q) ||
        item.province?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.subCategory?.toLowerCase().includes(q) ||
        item.hostId?.toLowerCase().includes(q)
      );
    });
  }, [listings, search]);

  const runConfirm = async () => {
    if (!confirm.open) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await confirm.onConfirm();
      setConfirm({ open: false });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ListingStatus) => {
    const labelMap: Record<ListingStatus, string> = {
      ACTIVE: "kích hoạt",
      HIDDEN: "tạm ẩn",
      DELETED: "xóa",
      PENDING: "chuyển về chờ duyệt",
    };

    setConfirm({
      open: true,
      title: "Đổi trạng thái dịch vụ",
      description: `Bạn đang chuẩn bị ${labelMap[newStatus]} dịch vụ này.`,
      confirmLabel: newStatus === "DELETED" ? "Xóa dịch vụ" : "Xác nhận",
      intent: newStatus === "DELETED" ? "danger" : "default",
      onConfirm: async () => {
        await AdminService.changeListingStatus(id, newStatus);
        setFeedback({ type: "success", message: "Đã cập nhật trạng thái dịch vụ." });
        if (selectedListing?.id === id) {
          setSelectedListing({ ...selectedListing, status: newStatus });
        }
        await fetchListings();
      },
    });
  };

  const getStatusBadge = (status?: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-blue-50 text-blue-700 border border-blue-100",
      ACTIVE: "bg-green-50 text-green-700 border border-green-100",
      HIDDEN: "bg-amber-50 text-amber-700 border border-amber-100",
      DELETED: "bg-red-50 text-red-700 border border-red-100",
    };
    return map[status ?? ""] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return {
    listings: filteredListings,
    rawListings: listings,
    loading,
    actionLoading,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
    selectedListing,
    setSelectedListing,
    confirm,
    setConfirm,
    feedback,
    handleConfirm: runConfirm,
    handleUpdateStatus,
    getStatusBadge,
    refresh: fetchListings,
  };
}
