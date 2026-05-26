import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export type Tab = "pending" | "all";

export function useAdminEnterprises() {
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingEnts, setPendingEnts] = useState<any[]>([]);
  const [allEnts, setAllEnts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.allSettled([
        AdminService.getPendingEnterprises(0, 50),
        AdminService.getAllEnterprises(0, 50),
      ]);
      if (pendingRes.status === "fulfilled") {
        setPendingEnts(pendingRes.value?.data?.content ?? []);
      }
      if (allRes.status === "fulfilled") {
        setAllEnts(allRes.value?.data?.content ?? []);
      }
    } catch (err) {
      console.error("Failed to load enterprises", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, approved: boolean) => {
    const label = approved ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (!confirm(`Bạn có chắc muốn ${label} doanh nghiệp này?`)) return;
    try {
      await AdminService.approveEnterprise(id, approved);
      if (approved) {
        try {
          await AdminService.completeEnterpriseUpgrade(id);
        } catch (e) {
          console.error("Failed to complete upgrade", e);
        }
      }
      fetchData();
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const displayed = tab === "pending" ? pendingEnts : allEnts;

  return {
    tab,
    setTab,
    pendingCount: pendingEnts.length,
    allCount: allEnts.length,
    loading,
    displayed,
    detailModal,
    setDetailModal,
    handleApprove,
    refresh: fetchData,
  };
}
