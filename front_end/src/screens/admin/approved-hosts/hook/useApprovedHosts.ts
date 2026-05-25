import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export function useApprovedHosts() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getApprovedHosts(0, 100);
      setHosts(res?.data?.content ?? []);
    } catch (error) {
      console.error("Failed to fetch approved hosts", error);
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
    detailModal,
    setDetailModal,
  };
}
