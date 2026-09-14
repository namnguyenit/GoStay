import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../composition";
import type { UserProfileEntity } from "../../domain/entity/user-profile.entity";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setPhoneNumber(data.phoneNumber || "");
      setAddress(data.address || "");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải thông tin hồ sơ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await userService.updateProfile({
        fullName,
        phoneNumber,
        address,
      });
      setProfile(updated);
      setIsEditing(false);
      setSuccessMsg("Cập nhật thông tin cá nhân thành công!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Cập nhật không thành công";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-600">
          Đang tải thông tin cá nhân...
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto my-12 max-w-md space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="text-lg font-bold text-red-700">Đã xảy ra lỗi</h2>
        <p className="text-sm text-red-600">{error}</p>
        <Button onClick={fetchProfile} variant="outline" size="sm">
          Thử lại
        </Button>
      </div>
    );
  }

  const initial = profile?.getDisplayName().charAt(0).toUpperCase() || "U";

  return (
    <div className="mx-auto my-8 max-w-3xl space-y-6 px-4">
      <Card className="overflow-hidden border-gray-200 shadow-md">
        <div className="flex h-32 items-end bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex translate-y-8 items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white bg-blue-500 shadow-md">
              {profile?.avatarUrl ? (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.getDisplayName()}
                />
              ) : null}
              <AvatarFallback className="bg-blue-600 text-2xl font-bold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="pt-8">
              <h1 className="text-xl leading-tight font-bold text-gray-900">
                {profile?.getDisplayName()}
              </h1>
              <p className="text-xs text-gray-500">@{profile?.username}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-12 pb-6">
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="border-blue-200 bg-blue-100 px-3 py-1 font-semibold text-blue-800"
            >
              <Shield className="mr-1 h-3.5 w-3.5" />
              {profile?.role || "Thành viên"}
            </Badge>
          </div>

          <Button
            variant={isEditing ? "ghost" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
          </Button>
        </div>

        <CardContent className="p-6">
          {successMsg && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ liên hệ</Label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase">
                  <User className="h-4 w-4 text-blue-600" />
                  Họ và tên
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.fullName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email liên hệ
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.email || "Chưa cập nhật"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Số điện thoại
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.phoneNumber || "Chưa cập nhật"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Địa chỉ
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.address || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operator Registration & Admin Card */}
      <Card className="border-blue-100 bg-blue-50/40 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-xl bg-blue-600 p-3 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Đăng ký làm Đối tác Nhà xe
              </h3>
              <p className="text-xs text-gray-600">
                Trở thành nhà xe đối tác của GoStay để mở rộng quy mô kinh doanh
                chuyến xe
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {profile?.isAdmin() && (
              <Link to="/operator/admin">
                <Button
                  variant="outline"
                  className="gap-1.5 border-blue-200 bg-white whitespace-nowrap text-blue-700 hover:bg-blue-50"
                >
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span>Duyệt Nhà Xe</span>
                </Button>
              </Link>
            )}
            <Link to="/operator/register">
              <Button className="gap-1.5 bg-blue-600 whitespace-nowrap text-white shadow-sm hover:bg-blue-700">
                <span>Đăng ký ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
