import React, { useState } from "react";
import { CarService } from "../services/car.service";
import type { CreateOperatorInput } from "../services/car.service";
import {
  ShieldCheck,
  Building,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const OperatorRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateOperatorInput>({
    companyName: "",
    businessLicense: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await CarService.createOperatorApplication(formData);
      setSuccess(true);
      setFormData({
        companyName: "",
        businessLicense: "",
        phoneNumber: "",
        email: "",
        address: "",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gửi đơn đăng ký thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mb-2 inline-flex rounded-full bg-blue-50 p-3 text-blue-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Đăng ký Trở thành Đối tác Nhà Xe
          </h1>
          <p className="text-sm text-gray-500">
            Hợp tác cùng GoStay để mở rộng mạng lưới khách hàng và quản lý xe
            khách đường dài chuyên nghiệp.
          </p>
        </div>

        {success && (
          <div className="flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div className="text-sm font-medium">
              Đơn đăng ký của bạn đã được gửi thành công! Ban quản trị sẽ kiểm
              duyệt và phản hồi sớm nhất.
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
              Tên Công ty / Nhà Xe *
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
              <Building className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Ví dụ: Công ty Vận Tải Hoàng Long"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
              Mã số Giấy phép Kinh doanh *
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
              <FileText className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="businessLicense"
                required
                value={formData.businessLicense}
                onChange={handleChange}
                placeholder="Ví dụ: 0101234567"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                Số điện thoại liên hệ *
              </label>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
                <Phone className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0987654321"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                Email *
              </label>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
                <Mail className="h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@nhaxe.com"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
              Địa chỉ trụ sở *
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Địa chỉ văn phòng / bến xe kinh doanh..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang gửi đơn..." : "Gửi Đơn Đăng Ký"}
          </button>
        </form>
      </div>
    </div>
  );
};
