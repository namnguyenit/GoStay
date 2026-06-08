import { useEffect, useState } from "react";
import AdminService, { AdminUser } from "@/services/admin.service";
import { getAdminErrorMessage } from "@/screens/admin/_components/admin-utils";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function useApprovedHosts() {
  const [hosts, setHosts] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getApprovedHosts(0, 100);
      setHosts(res?.data?.content ?? []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách host đã duyệt."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  return {
    hosts,
    loading,
    feedback,
    detailModal,
    setDetailModal,
  };
}
