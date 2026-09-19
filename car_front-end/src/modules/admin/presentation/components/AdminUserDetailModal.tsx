import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Building2,
} from "lucide-react";
import type { AdminUserDetailEntity } from "../../domain/entity/admin-user-detail.entity";
import { adminOperatorService } from "../../composition";

interface AdminUserDetailModalProps {
  userId: string | null;
  operatorName?: string;
  open: boolean;
  onClose: () => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  userId,
  operatorName,
  open,
  onClose,
}) => {
  const [user, setUser] = useState<AdminUserDetailEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !userId) {
      setUser(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminOperatorService.getUserDetailById(userId);
        if (isMounted) {
          setUser(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể lấy thông tin chi tiết người dùng."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [open, userId]);

  const handleCopyId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-6 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700">
            <Building2 className="h-4 w-4" />
            <span>Nhà xe: {operatorName || "Chưa xác định"}</span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Chi tiết Chủ sở hữu (User)
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Thông tin định danh tài khoản người dùng sở hữu nhà xe
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center space-y-3 py-6">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-xs font-medium text-gray-500">
              Đang tải thông tin tài khoản #{userId}...
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                Không thể tải thông tin
              </p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="font-mono text-xs text-gray-500">
                User ID: {userId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
                title="Sao chép ID"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-5 py-2">
            {/* User Header with Avatar & Names */}
            <div className="flex items-center space-x-3.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
              <Avatar className="h-14 w-14 border border-purple-200">
                <AvatarImage src={user.avatarUrl} alt={user.getDisplayName()} />
                <AvatarFallback className="bg-purple-100 font-bold text-purple-700">
                  {user.getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-bold text-gray-900">
                  {user.fullName || user.username}
                </h4>
                <p className="truncate text-xs font-medium text-gray-500">
                  @{user.username || "Chưa đặt username"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      user.isActive
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-red-300 bg-red-50 text-red-700"
                    }`}
                  >
                    {user.isActive ? (
                      <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3 text-red-600" />
                    )}
                    {user.isActive ? "Hoạt động" : "Bị khóa"}
                  </Badge>

                  {user.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="border border-purple-200 bg-purple-50 text-[10px] font-semibold text-purple-700"
                    >
                      <Shield className="mr-1 h-2.5 w-2.5" />
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="space-y-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white p-4 text-xs">
              {/* User ID */}
              <div className="flex items-center justify-between pb-2.5">
                <span className="flex items-center font-medium text-gray-500">
                  <User className="mr-2 h-3.5 w-3.5 text-gray-400" />
                  Mã User ID
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-gray-900">{user.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="rounded p-1 text-gray-400 hover:text-gray-600"
                    title="Sao chép ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center font-medium text-gray-500">
                  <Mail className="mr-2 h-3.5 w-3.5 text-gray-400" />
                  Email
                </span>
                <a
                  href={`mailto:${user.email}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {user.email || "Chưa cập nhật"}
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-2.5">
                <span className="flex items-center font-medium text-gray-500">
                  <Phone className="mr-2 h-3.5 w-3.5 text-gray-400" />
                  Số điện thoại
                </span>
                <span className="font-medium text-gray-900">
                  {user.phoneNumber || "Chưa cập nhật"}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start justify-between pt-2.5">
                <span className="flex items-center font-medium text-gray-500">
                  <MapPin className="mr-2 h-3.5 w-3.5 text-gray-400" />
                  Địa chỉ
                </span>
                <span className="max-w-[200px] text-right font-medium text-gray-900">
                  {user.address || "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
