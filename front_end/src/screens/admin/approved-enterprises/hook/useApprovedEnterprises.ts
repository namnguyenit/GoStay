import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export function useApprovedEnterprises() {
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });

  const fetchEnterprises = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getApprovedEnterprises(0, 100);
      setEnterprises(res?.data?.content ?? []);
    } catch (error) {
      console.error("Failed to fetch approved enterprises", error);
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
    detailModal,
    setDetailModal,
    refresh: fetchEnterprises,
  };
}
