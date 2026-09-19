import React, { useEffect, useState, useMemo } from "react";
import { adminOperatorService } from "../../composition";
import type { OperatorApplicationEntity } from "../../domain/entity/operator-application.entity";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { AdminUserDetailModal } from "../components/AdminUserDetailModal";
import { AdminRejectApplicationModal } from "../components/AdminRejectApplicationModal";
import { AdminApplicationDetailModal } from "../components/AdminApplicationDetailModal";

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export const AdminOperatorApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<OperatorApplicationEntity[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("PENDING");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals state
  const [selectedUserModal, setSelectedUserModal] = useState<{
    userId: string;
    operatorName: string;
  } | null>(null);

  const [detailApplication, setDetailApplication] =
    useState<OperatorApplicationEntity | null>(null);

  const [rejectingApplication, setRejectingApplication] =
    useState<OperatorApplicationEntity | null>(null);

  const [approvingApplication, setApprovingApplication] =
    useState<OperatorApplicationEntity | null>(null);

  const [processing, setProcessing] = useState<boolean>(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminOperatorService.getOperatorApplications();
      setApplications(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách đơn đăng ký nhà xe."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtered and searched data
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        selectedStatus === "ALL" ? true : app.status === selectedStatus;

      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        app.name.toLowerCase().includes(term) ||
        app.userId.toLowerCase().includes(term) ||
        app.phone.toLowerCase().includes(term) ||
        app.address.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [applications, selectedStatus, searchTerm]);

  // Status counts
  const counts = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.isPending()).length;
    const approved = applications.filter((a) => a.isApproved()).length;
    const rejected = applications.filter((a) => a.isRejected()).length;
    return { total, pending, approved, rejected };
  }, [applications]);

  // Handle Approve
  const handleConfirmApprove = async () => {
    if (!approvingApplication) return;
    setProcessing(true);
    try {
      await adminOperatorService.processOperatorApplication({
        applicationId: approvingApplication.id,
        status: "APPROVED",
      });
      setFeedback({
        type: "success",
        message: `Đã phê duyệt đơn đăng ký của nhà xe "${approvingApplication.name}" thành công! Bản ghi Nhà xe đã được khởi tạo.`,
      });
      setApprovingApplication(null);
      await fetchApplications();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Đã có lỗi xảy ra khi phê duyệt đơn đăng ký.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle Reject
  const handleConfirmReject = async (reason: string) => {
    if (!rejectingApplication) return;
    setProcessing(true);
    try {
      await adminOperatorService.processOperatorApplication({
        applicationId: rejectingApplication.id,
        status: "REJECTED",
        rejectReason: reason,
      });
      setFeedback({
        type: "success",
        message: `Đã từ chối đơn đăng ký của nhà xe "${rejectingApplication.name}".`,
      });
      setRejectingApplication(null);
      await fetchApplications();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Đã có lỗi xảy ra khi từ chối đơn đăng ký.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center text-2xl font-bold tracking-tight text-gray-900">
            <ShieldCheck className="mr-2.5 h-7 w-7 text-purple-600" />
            <span>Duyệt Đơn Đăng Ký Nhà Xe</span>
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Kiểm tra thông tin đối tác và phê duyệt hoặc từ chối các đơn xin gia
            nhập hệ thống GoStay
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={loading}
            className="gap-1.5 text-xs text-gray-700"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card
          onClick={() => setSelectedStatus("ALL")}
          className={`cursor-pointer border transition-all ${
            selectedStatus === "ALL"
              ? "border-purple-300 ring-2 ring-purple-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Tất cả đơn
              </span>
              <Inbox className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {counts.total}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelectedStatus("PENDING")}
          className={`cursor-pointer border transition-all ${
            selectedStatus === "PENDING"
              ? "border-amber-300 ring-2 ring-amber-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase">
                Chờ xét duyệt
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {counts.pending}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelectedStatus("APPROVED")}
          className={`cursor-pointer border transition-all ${
            selectedStatus === "APPROVED"
              ? "border-green-300 ring-2 ring-green-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-green-600 uppercase">
                Đã phê duyệt
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {counts.approved}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelectedStatus("REJECTED")}
          className={`cursor-pointer border transition-all ${
            selectedStatus === "REJECTED"
              ? "border-red-300 ring-2 ring-red-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-600 uppercase">
                Đã từ chối
              </span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {counts.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-medium shadow-xs ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <Card className="border-gray-200 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-gray-100 p-1 text-xs">
              {(
                [
                  { key: "PENDING", label: "Chờ duyệt", count: counts.pending },
                  { key: "ALL", label: "Tất cả", count: counts.total },
                  {
                    key: "APPROVED",
                    label: "Đã duyệt",
                    count: counts.approved,
                  },
                  {
                    key: "REJECTED",
                    label: "Đã từ chối",
                    count: counts.rejected,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                    selectedStatus === tab.key
                      ? "bg-white font-bold text-gray-900 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                      selectedStatus === tab.key
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm tên nhà xe, SĐT, User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 rounded-lg pl-9 text-xs focus-visible:ring-purple-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {/* Applications Table Card */}
      <Card className="border-gray-200 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-gray-900">
            Danh sách Đơn Đăng Ký ({filteredApplications.length})
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            {selectedStatus === "PENDING"
              ? "Các đơn đăng ký mới đang chờ Ban quản trị xét duyệt"
              : selectedStatus === "APPROVED"
                ? "Các đơn đăng ký đã được phê duyệt làm Nhà xe"
                : selectedStatus === "REJECTED"
                  ? "Các đơn đăng ký đã bị từ chối"
                  : "Toàn bộ danh sách đơn đăng ký trên hệ thống"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center space-y-3 p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-xs font-medium text-gray-500">
                Đang tải danh sách đơn đăng ký...
              </p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center space-y-2.5 p-8 text-center">
              <Building2 className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">
                Không có đơn đăng ký nào phù hợp.
              </p>
              <p className="text-xs text-gray-400">
                {searchTerm
                  ? `Không tìm thấy kết quả khớp với "${searchTerm}"`
                  : "Hiện không có đơn nào ở trạng thái này."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="border-y border-gray-200 bg-gray-50/75 text-[11px] font-semibold tracking-wider text-gray-700 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">STT</th>
                    <th className="px-5 py-3.5">Tên Nhà Xe</th>
                    <th className="px-5 py-3.5">Người nộp (User ID)</th>
                    <th className="px-5 py-3.5">Số điện thoại</th>
                    <th className="px-5 py-3.5">Địa chỉ trụ sở</th>
                    <th className="px-5 py-3.5">Ngày gửi đơn</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((app, idx) => {
                    const badge = app.getStatusBadgeInfo();
                    return (
                      <tr
                        key={app.id}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-2">
                            <div className="rounded-lg bg-purple-50 p-1.5 text-purple-600">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-gray-900">
                              {app.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-800">
                              <User className="mr-1 h-3 w-3 text-gray-400" />
                              {app.userId}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 border-purple-200 px-1.5 text-[10px] text-purple-700 hover:bg-purple-50"
                              onClick={() =>
                                setSelectedUserModal({
                                  userId: app.userId,
                                  operatorName: app.name,
                                })
                              }
                              title="Xem thông tin tài khoản người nộp"
                            >
                              Xem User
                            </Button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center font-medium text-gray-800">
                            <Phone className="mr-1 h-3 w-3 text-gray-400" />
                            {app.phone}
                          </span>
                        </td>
                        <td
                          className="max-w-[200px] truncate px-5 py-3.5 text-gray-600"
                          title={app.address}
                        >
                          {app.address}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                          <span className="inline-flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                            {app.getFormattedCreatedAt()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant="outline"
                            className={`px-2 py-0.5 font-semibold ${badge.borderClass} ${badge.variantClass}`}
                          >
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 border-gray-200 px-2 text-xs text-gray-700 hover:bg-gray-100"
                              onClick={() => setDetailApplication(app)}
                              title="Xem chi tiết đơn nộp"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-500" />
                              <span>Chi tiết</span>
                            </Button>

                            {app.canBeProcessed() && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 gap-1 bg-green-600 px-2 text-xs text-white hover:bg-green-700"
                                  onClick={() => setApprovingApplication(app)}
                                  title="Phê duyệt nhà xe"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Duyệt</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 gap-1 border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setRejectingApplication(app)}
                                  title="Từ chối đơn đăng ký"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Từ chối</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal 1: Chi tiết đơn đăng ký */}
      <AdminApplicationDetailModal
        open={Boolean(detailApplication)}
        application={detailApplication}
        onClose={() => setDetailApplication(null)}
        onApprove={(app) => setApprovingApplication(app)}
        onReject={(app) => setRejectingApplication(app)}
        onViewUser={(userId, operatorName) =>
          setSelectedUserModal({ userId, operatorName })
        }
      />

      {/* Modal 2: Xác nhận Phê duyệt đơn */}
      <Dialog
        open={Boolean(approvingApplication)}
        onOpenChange={(isOpen) =>
          !isOpen && !processing && setApprovingApplication(null)
        }
      >
        <DialogContent className="max-w-md p-6 sm:rounded-2xl">
          <DialogHeader className="space-y-2 text-center sm:text-left">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600 sm:mx-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Xác nhận Phê duyệt Nhà xe
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Bạn có chắc chắn muốn phê duyệt đơn đăng ký của nhà xe{" "}
              <strong className="text-gray-900">
                {approvingApplication?.name}
              </strong>{" "}
              (Chủ sở hữu:{" "}
              <span className="font-mono">{approvingApplication?.userId}</span>
              )?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-green-200 bg-green-50/70 p-3.5 text-xs text-green-800">
            <p className="font-semibold text-green-900">
              Hệ thống sẽ tự động thực hiện:
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px]">
              <li>Khởi tạo một bản ghi Nhà xe mới (`Operator`) trong CSDL.</li>
              <li>
                Nâng cấp vai trò của tài khoản người dùng thành Đối tác Nhà xe
                (`OPERATOR`).
              </li>
              <li>
                Người dùng có thể đăng nhập vào Kênh Nhà xe
                (`/operator/dashboard`).
              </li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApprovingApplication(null)}
              disabled={processing}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmApprove}
              disabled={processing}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {processing ? "Đang xử lý..." : "Xác nhận Phê duyệt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Nhập lý do từ chối */}
      <AdminRejectApplicationModal
        open={Boolean(rejectingApplication)}
        applicationName={rejectingApplication?.name}
        applicationId={rejectingApplication?.id}
        onClose={() => setRejectingApplication(null)}
        onConfirm={handleConfirmReject}
        loading={processing}
      />

      {/* Modal 4: Xem chi tiết tài khoản chủ sở hữu (User) */}
      <AdminUserDetailModal
        open={Boolean(selectedUserModal)}
        userId={selectedUserModal?.userId || null}
        operatorName={selectedUserModal?.operatorName}
        onClose={() => setSelectedUserModal(null)}
      />
    </div>
  );
};
