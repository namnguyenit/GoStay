import React, { useEffect, useState } from "react";
import { CarService } from "../services/car.service";
import type { OperatorApplication } from "../types";
import {
  UserCheck,
  Check,
  X,
  RefreshCw,
  Clock,
  Building,
  Phone,
  Mail,
} from "lucide-react";

export const OperatorAdminPage: React.FC = () => {
  const [applications, setApplications] = useState<OperatorApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CarService.getOperatorApplications();
      setApplications(data || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể lấy danh sách đơn đăng ký";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleProcess = async (id: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    try {
      await CarService.processOperatorApplication(id, status);
      await fetchApplications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Xử lý thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
            <UserCheck className="h-7 w-7 text-blue-600" />
            <span>Quản lý & Duyệt Đơn Đăng Ký Nhà Xe</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Endpoint Gateway: /api/v1/operator-applications
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Đang tải danh sách đơn đăng ký...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-12 text-center text-gray-500 shadow-sm">
          Chưa có đơn đăng ký nhà xe nào trong hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {applications.map((app) => (
            <div
              key={app.id}
              className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {app.companyName}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    app.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : app.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>

              <div className="space-y-1.5 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                <div>
                  <strong>GPKD:</strong> {app.businessLicense}
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>SĐT: {app.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span>Email: {app.email}</span>
                </div>
                <div>
                  <strong>Địa chỉ:</strong> {app.address}
                </div>
                <div className="flex items-center space-x-1 pt-1 text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Ngày đăng ký:{" "}
                    {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {app.status === "PENDING" && (
                <div className="flex space-x-2 pt-2">
                  <button
                    disabled={processingId === app.id}
                    onClick={() => handleProcess(app.id, "APPROVED")}
                    className="flex flex-1 items-center justify-center space-x-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    <span>Duyệt đơn</span>
                  </button>
                  <button
                    disabled={processingId === app.id}
                    onClick={() => handleProcess(app.id, "REJECTED")}
                    className="flex flex-1 items-center justify-center space-x-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                    <span>Từ chối</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
