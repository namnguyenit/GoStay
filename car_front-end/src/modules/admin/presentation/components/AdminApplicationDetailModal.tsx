import React from "react";
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
import {
  Building2,
  Phone,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { OperatorApplicationEntity } from "../../domain/entity/operator-application.entity";

interface AdminApplicationDetailModalProps {
  application: OperatorApplicationEntity | null;
  open: boolean;
  onClose: () => void;
  onApprove: (app: OperatorApplicationEntity) => void;
  onReject: (app: OperatorApplicationEntity) => void;
  onViewUser: (userId: string, operatorName: string) => void;
}

export const AdminApplicationDetailModal: React.FC<
  AdminApplicationDetailModalProps
> = ({ application, open, onClose, onApprove, onReject, onViewUser }) => {
  if (!application) return null;

  const badgeInfo = application.getStatusBadgeInfo();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-6 sm:rounded-2xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700">
            <Building2 className="h-4 w-4" />
            <span>Chi tiết Hồ sơ Đăng ký</span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {application.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Đơn đăng ký trở thành đối tác Nhà xe chính thức trên GoStay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Status banner */}
          <div
            className={`flex items-center justify-between rounded-xl border p-3.5 ${badgeInfo.borderClass} ${badgeInfo.variantClass}`}
          >
            <div className="flex items-center space-x-2 font-semibold">
              {application.isApproved() ? (
                <CheckCircle className="h-4 w-4" />
              ) : application.isRejected() ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>Trạng thái: {badgeInfo.label}</span>
            </div>
            <Badge
              variant="outline"
              className={`bg-white font-mono text-[10px]`}
            >
              {application.status}
            </Badge>
          </div>

          {/* If rejected, show reject reason */}
          {application.rejectReason && (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-red-800">
              <div className="flex items-center space-x-1.5 font-bold text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Lý do từ chối:</span>
              </div>
              <p className="mt-1 text-xs">{application.rejectReason}</p>
            </div>
          )}

          {/* Details list */}
          <div className="space-y-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white p-4">
            {/* Operator Name */}
            <div className="flex items-center justify-between pb-2.5">
              <span className="flex items-center font-medium text-gray-500">
                <Building2 className="mr-2 h-3.5 w-3.5 text-gray-400" />
                Tên Nhà xe
              </span>
              <span className="font-bold text-gray-900">
                {application.name}
              </span>
            </div>

            {/* Applicant User ID */}
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center font-medium text-gray-500">
                <User className="mr-2 h-3.5 w-3.5 text-gray-400" />
                Mã Chủ sở hữu
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-gray-900">
                  {application.userId}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onViewUser(application.userId, application.name)
                  }
                  className="h-6 border-purple-200 px-2 text-[11px] text-purple-700 hover:bg-purple-50"
                >
                  Xem User
                </Button>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center font-medium text-gray-500">
                <Phone className="mr-2 h-3.5 w-3.5 text-gray-400" />
                Số điện thoại liên hệ
              </span>
              <a
                href={`tel:${application.phone}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {application.phone}
              </a>
            </div>

            {/* Address */}
            <div className="flex items-start justify-between py-2.5">
              <span className="flex items-center font-medium text-gray-500">
                <MapPin className="mr-2 h-3.5 w-3.5 text-gray-400" />
                Địa chỉ trụ sở
              </span>
              <span className="max-w-[240px] text-right font-medium text-gray-900">
                {application.address}
              </span>
            </div>

            {/* Submission Date */}
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center font-medium text-gray-500">
                <Calendar className="mr-2 h-3.5 w-3.5 text-gray-400" />
                Ngày gửi đơn
              </span>
              <span className="text-gray-700">
                {application.getFormattedCreatedAt()}
              </span>
            </div>

            {/* Updated Date */}
            <div className="flex items-center justify-between pt-2.5">
              <span className="flex items-center font-medium text-gray-500">
                <Clock className="mr-2 h-3.5 w-3.5 text-gray-400" />
                Cập nhật lần cuối
              </span>
              <span className="text-gray-700">
                {application.getFormattedUpdatedAt()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>

          {application.canBeProcessed() && (
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  onClose();
                  onReject(application);
                }}
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                <span>Từ chối</span>
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  onClose();
                  onApprove(application);
                }}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                <span>Phê duyệt</span>
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
