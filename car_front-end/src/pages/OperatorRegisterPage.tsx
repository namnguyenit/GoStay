import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { operatorService } from "@/modules/operator/composition";
import type { OperatorStatusEntity } from "@/modules/operator/domain/entity/operator-status.entity";
import {
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const OperatorRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Status check state
  const [operatorStatus, setOperatorStatus] =
    useState<OperatorStatusEntity | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Form state - Only the 3 necessary fields per specification
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Submission state
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  const checkCurrentStatus = async () => {
    setCheckingStatus(true);
    try {
      const status = await operatorService.getMyOperatorStatus();
      setOperatorStatus(status);

      // If there is a previous application that was rejected, prefill the form
      if (status.hasRejectedApplication() && status.latestApplication) {
        setName(status.latestApplication.name || "");
        setPhone(status.latestApplication.phone || "");
        setAddress(status.latestApplication.address || "");
      }
    } catch {
      // Ignore error if not logged in or network fails
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const validate = (): boolean => {
    const errors: { name?: string; phone?: string; address?: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = "Vui lòng nhập tên nhà xe.";
    } else if (trimmedName.length < 3 || trimmedName.length > 100) {
      errors.name = "Tên nhà xe phải có độ dài từ 3 đến 100 ký tự.";
    }

    const trimmedPhone = phone.trim();
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!trimmedPhone) {
      errors.phone = "Vui lòng nhập số điện thoại liên hệ.";
    } else if (!phoneRegex.test(trimmedPhone) || trimmedPhone.length !== 10) {
      errors.phone =
        "Số điện thoại không đúng định dạng SĐT Việt Nam (10 chữ số).";
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      errors.address = "Vui lòng nhập địa chỉ trụ sở chính của nhà xe.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await operatorService.requestOperatorApplication({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setSuccess(true);
      // Refresh status to show pending card
      await checkCurrentStatus();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gửi đơn đăng ký thất bại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-gray-500">
          Đang kiểm tra trạng thái tài khoản...
        </p>
      </div>
    );
  }

  // State 1: Already an Operator
  if (operatorStatus?.canAccessOperatorPortal()) {
    return (
      <div className="mx-auto my-8 max-w-xl px-4">
        <div className="space-y-5 rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-900">
              Bạn Đã Là Đối Tác Nhà Xe Chính Thức
            </h2>
            <p className="text-xs text-gray-600">
              Tài khoản của bạn đã được phê duyệt làm Nhà xe{" "}
              <strong className="text-gray-900">
                {operatorStatus.operator?.name}
              </strong>
              . Bạn không cần nộp thêm đơn đăng ký mới.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/operator/dashboard">
              <Button className="gap-1.5 bg-blue-600 text-white shadow-xs hover:bg-blue-700">
                <LayoutDashboard className="h-4 w-4" />
                <span>Vào Kênh Quản Trị Nhà Xe</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Has a PENDING application
  if (operatorStatus?.hasPendingApplication()) {
    const pendingApp = operatorStatus.latestApplication;
    return (
      <div className="mx-auto my-8 max-w-xl px-4">
        <div className="space-y-6 rounded-2xl border border-amber-200 bg-white p-8 shadow-md">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Đơn Đăng Ký Đang Chờ Xét Duyệt
            </h2>
            <p className="text-xs text-gray-600">
              Bạn đã nộp đơn đăng ký trở thành đối tác Nhà xe. Ban quản trị
              GoStay đang xem xét hồ sơ của bạn.
            </p>
          </div>

          <div className="space-y-3 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs">
            <div className="flex items-center justify-between pb-2">
              <span className="font-medium text-gray-500">Tên Nhà xe:</span>
              <span className="font-bold text-gray-900">
                {pendingApp?.name || name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-500">Số điện thoại:</span>
              <span className="font-medium text-gray-900">
                {pendingApp?.phone || phone}
              </span>
            </div>
            <div className="flex items-start justify-between py-2">
              <span className="font-medium text-gray-500">Địa chỉ trụ sở:</span>
              <span className="max-w-[240px] text-right font-medium text-gray-900">
                {pendingApp?.address || address}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-medium text-gray-500">Trạng thái:</span>
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 font-semibold text-amber-700"
              >
                Chờ xét duyệt (PENDING)
              </Badge>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Về Trang chủ</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Registration Form (Only the 3 essential fields per specification)
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Đăng Ký Làm Đối Tác Nhà Xe
          </h1>
          <p className="text-xs text-gray-500">
            Chỉ cần cung cấp 3 thông tin cơ bản để bắt đầu mở rộng kinh doanh
            cùng GoStay
          </p>
        </div>

        {/* Previous Rejected Notice */}
        {operatorStatus?.hasRejectedApplication() && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Hồ sơ đăng ký trước đó chưa được thông qua</span>
            </div>
            {operatorStatus.latestApplication?.rejectReason && (
              <p className="mt-1 text-xs">
                <strong>Lý do:</strong>{" "}
                {operatorStatus.latestApplication.rejectReason}
              </p>
            )}
            <p className="mt-1 text-[11px] text-amber-700">
              Vui lòng cập nhật lại các thông tin chính xác bên dưới và gửi lại
              đơn.
            </p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              Gửi đơn đăng ký thành công! Yêu cầu của bạn đang chờ Ban quản trị
              xem xét và phê duyệt.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <div>{error}</div>
          </div>
        )}

        {/* Registration Form: ONLY 3 FIELDS (name, phone, address) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Tên Nhà Xe */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="flex items-center text-xs font-semibold text-gray-700"
            >
              <Building2 className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              <span>Tên Nhà Xe / Đơn vị vận tải</span>
              <span className="ml-1 text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors({ ...fieldErrors, name: undefined });
              }}
              placeholder="Ví dụ: Nhà xe Phương Trang, Nhà xe Hải Vân..."
              className={`h-10 text-xs ${
                fieldErrors.name
                  ? "border-red-500 focus-visible:ring-red-400"
                  : "focus-visible:ring-blue-500"
              }`}
            />
            {fieldErrors.name ? (
              <p className="text-[11px] text-red-500">{fieldErrors.name}</p>
            ) : (
              <p className="text-[10px] text-gray-400">
                Độ dài từ 3 đến 100 ký tự.
              </p>
            )}
          </div>

          {/* Field 2: Số điện thoại liên hệ */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="flex items-center text-xs font-semibold text-gray-700"
            >
              <Phone className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              <span>Số điện thoại liên hệ</span>
              <span className="ml-1 text-red-500">*</span>
            </label>
            <Input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone)
                  setFieldErrors({ ...fieldErrors, phone: undefined });
              }}
              placeholder="Ví dụ: 0912345678"
              className={`h-10 text-xs ${
                fieldErrors.phone
                  ? "border-red-500 focus-visible:ring-red-400"
                  : "focus-visible:ring-blue-500"
              }`}
            />
            {fieldErrors.phone ? (
              <p className="text-[11px] text-red-500">{fieldErrors.phone}</p>
            ) : (
              <p className="text-[10px] text-gray-400">
                Đúng định dạng số điện thoại Việt Nam 10 chữ số.
              </p>
            )}
          </div>

          {/* Field 3: Địa chỉ trụ sở chính */}
          <div className="space-y-1.5">
            <label
              htmlFor="address"
              className="flex items-center text-xs font-semibold text-gray-700"
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              <span>Địa chỉ trụ sở chính</span>
              <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              id="address"
              required
              rows={3}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (fieldErrors.address)
                  setFieldErrors({ ...fieldErrors, address: undefined });
              }}
              placeholder="Địa chỉ văn phòng / bến xe tiếp nhận khách..."
              className={`w-full rounded-md border p-2.5 text-xs shadow-xs focus:ring-2 focus:outline-hidden ${
                fieldErrors.address
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
              }`}
            />
            {fieldErrors.address ? (
              <p className="text-[11px] text-red-500">{fieldErrors.address}</p>
            ) : (
              <p className="text-[10px] text-gray-400">
                Nơi đặt văn phòng hoặc bến bãi hoạt động chính của nhà xe.
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-blue-600 text-white shadow-xs hover:bg-blue-700"
            >
              {loading ? "Đang gửi đơn..." : "Gửi Yêu Cầu Đăng Ký"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
