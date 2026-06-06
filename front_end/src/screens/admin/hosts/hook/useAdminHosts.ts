import { useEffect, useState } from "react";
import AdminService, { AdminHostDetail, AdminUser } from "@/services/admin.service";
import {
  ConfirmState,
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminErrorMessage,
} from "@/screens/admin/_components/admin-utils";

export type Tab = "pending" | "all";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function useAdminHosts() {
  const [tab, setRawTab] = useState<Tab>("pending");
  const [displayed, setDisplayed] = useState<AdminUser[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; host: AdminHostDetail | null }>({
    open: false,
    host: null,
  });
  const [detailLoading, setDetailLoading] = useState(false);

  const setTab = (nextTab: Tab) => {
    setRawTab(nextTab);
    setPage(0);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currentRes, pendingCountRes, allCountRes] = await Promise.all([
        tab === "pending"
          ? AdminService.getPendingHosts(page, DEFAULT_ADMIN_PAGE_SIZE)
          : AdminService.getAllHosts(page, DEFAULT_ADMIN_PAGE_SIZE),
        AdminService.getPendingHosts(0, 1),
        AdminService.getAllHosts(0, 1),
      ]);

      setDisplayed(currentRes?.data?.content ?? []);
      setTotalPages(Math.max(currentRes?.data?.totalPages ?? 1, 1));
      setTotalElements(currentRes?.data?.totalElements ?? 0);
      setPendingCount(pendingCountRes?.data?.totalElements ?? 0);
      setAllCount(allCountRes?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách host."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, tab]);

  const handleViewDetail = async (id: string) => {
    setDetailModal({ open: true, host: null });
    setDetailLoading(true);
    try {
      const res = await AdminService.getHostDetail(id);
      setDetailModal({ open: true, host: res?.data ?? null });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải thông tin host."),
      });
      setDetailModal({ open: false, host: null });
    } finally {
      setDetailLoading(false);
    }
  };

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

  const handleApprove = (id: string, approved: boolean) => {
    const label = approved ? "phê duyệt" : "từ chối";
    setConfirm({
      open: true,
      title: approved ? "Phê duyệt Host" : "Từ chối Host",
      description: `Bạn đang chuẩn bị ${label} hồ sơ host này.`,
      confirmLabel: approved ? "Duyệt host" : "Từ chối",
      intent: approved ? "success" : "danger",
      onConfirm: async () => {
        await AdminService.approveHost(id, approved);
        if (approved) {
          await AdminService.completeHostUpgrade(id);
        }
        setFeedback({
          type: "success",
          message: approved ? "Đã duyệt và hoàn tất nâng cấp Host." : "Đã từ chối hồ sơ Host.",
        });
        await fetchData();
      },
    });
  };

  return {
    tab,
    setTab,
    pendingCount,
    allCount,
    loading,
    actionLoading,
    displayed,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
    detailModal,
    setDetailModal,
    detailLoading,
    confirm,
    setConfirm,
    feedback,
    handleConfirm: runConfirm,
    handleViewDetail,
    handleApprove,
  };
}
