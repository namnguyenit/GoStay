import { useEffect, useState } from "react";
import AdminService, { AdminUser } from "@/services/admin.service";
import { getAdminErrorMessage } from "@/screens/admin/_components/admin-utils";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function useApprovedEnterprises() {
  const [enterprises, setEnterprises] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });

  const fetchEnterprises = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getApprovedEnterprises(0, 100);
      setEnterprises(res?.data?.content ?? []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách doanh nghiệp đã duyệt."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterprises();
  }, []);

  return {
    enterprises,
    loading,
    feedback,
    detailModal,
    setDetailModal,
    refresh: fetchEnterprises,
  };
}
