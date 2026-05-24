import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export type Tab = "pending" | "all";

export function useAdminHosts() {
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingHosts, setPendingHosts] = useState<any[]>([]);
  const [allHosts, setAllHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ open: boolean; host: any | null }>({
    open: false,
    host: null,
  });
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.allSettled([
        AdminService.getPendingHosts(0, 50),
        AdminService.getAllHosts(0, 50),
      ]);
      if (pendingRes.status === "fulfilled") {
        setPendingHosts(pendingRes.value?.data?.content ?? []);
      }
      if (allRes.status === "fulfilled") {
        setAllHosts(allRes.value?.data?.content ?? []);
      }
    } catch (err) {
      console.error("Failed to load hosts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetail = async (id: string) => {
    setDetailModal({ open: true, host: null });
    setDetailLoading(true);
    try {
      const res = await AdminService.getHostDetail(id);
      setDetailModal({ open: true, host: res?.data ?? null });
    } catch {
      setDetailModal({ open: true, host: { error: true } });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    const label = approved ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (!confirm(`Bạn có chắc muốn ${label} đơn này?`)) return;
    try {
      await AdminService.approveHost(id, approved);
      if (approved) {
        try {
          await AdminService.completeHostUpgrade(id);
        } catch {}
      }
      fetchData();
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const displayed = tab === "pending" ? pendingHosts : allHosts;

  return {
    tab,
    setTab,
    pendingCount: pendingHosts.length,
    allCount: allHosts.length,
    loading,
    displayed,
    detailModal,
    setDetailModal,
    detailLoading,
    handleViewDetail,
    handleApprove
  };
}