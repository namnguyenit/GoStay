import { useEffect, useState } from "react";
import AdminService, { AdminUser } from "@/services/admin.service";
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

export function useAdminEnterprises() {
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
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });

  const setTab = (nextTab: Tab) => {
    setRawTab(nextTab);
    setPage(0);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currentRes, pendingCountRes, allCountRes] = await Promise.all([
        tab === "pending"
          ? AdminService.getPendingEnterprises(page, DEFAULT_ADMIN_PAGE_SIZE)
          : AdminService.getAllEnterprises(page, DEFAULT_ADMIN_PAGE_SIZE),
        AdminService.getPendingEnterprises(0, 1),
        AdminService.getAllEnterprises(0, 1),
      ]);

      setDisplayed(currentRes?.data?.content ?? []);
      setTotalPages(Math.max(currentRes?.data?.totalPages ?? 1, 1));
      setTotalElements(currentRes?.data?.totalElements ?? 0);
      setPendingCount(pendingCountRes?.data?.totalElements ?? 0);
      setAllCount(allCountRes?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách doanh nghiệp."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, tab]);

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
      title: approved ? "Phê duyệt Enterprise" : "Từ chối Enterprise",
      description: `Bạn đang chuẩn bị ${label} hồ sơ doanh nghiệp này.`,
      confirmLabel: approved ? "Duyệt doanh nghiệp" : "Từ chối",
      intent: approved ? "success" : "danger",
      onConfirm: async () => {
        await AdminService.approveEnterprise(id, approved);
        if (approved) {
          await AdminService.completeEnterpriseUpgrade(id);
        }
        setFeedback({
          type: "success",
          message: approved
            ? "Đã duyệt và hoàn tất nâng cấp Enterprise."
            : "Đã từ chối hồ sơ Enterprise.",
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
    confirm,
    setConfirm,
    feedback,
    handleConfirm: runConfirm,
    handleApprove,
    refresh: fetchData,
  };
}
