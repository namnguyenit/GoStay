import React, { useEffect, useState } from "react";
import { adminOperatorService } from "../../composition";
import type { OperatorEntity } from "../../domain/entity/operator.entity";
import type { PaginationMeta } from "../../application/port/admin-operator.service.interface";
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
  Building2,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  Eye,
} from "lucide-react";
import { AdminUserDetailModal } from "../components/AdminUserDetailModal";

export const AdminOperatorListPage: React.FC = () => {
  const [operators, setOperators] = useState<OperatorEntity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Modal xem chi tiết User
  const [selectedUserForModal, setSelectedUserForModal] = useState<{
    userId: string;
    operatorName: string;
  } | null>(null);

  const fetchOperators = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminOperatorService.getOperators({
        search: searchQuery || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      setOperators(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Lỗi tải danh sách nhà xe";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, [searchQuery, page, limit, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPage(1);
    if (val === "newest") {
      setSortBy("createdAt");
      setSortOrder("desc");
    } else if (val === "oldest") {
      setSortBy("createdAt");
      setSortOrder("asc");
    } else if (val === "name_asc") {
      setSortBy("name");
      setSortOrder("asc");
    } else if (val === "name_desc") {
      setSortBy("name");
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 text-white shadow-md sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Quản lý Đối tác Nhà Xe
            </h1>
            <Badge className="border-purple-300 bg-purple-500/80 text-white">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Chính thức
            </Badge>
          </div>
          <p className="mt-1 text-xs text-purple-100">
            Xem và quản lý tất cả nhà xe đã được duyệt và đang hoạt động trên hệ
            thống GoStay
          </p>
        </div>

        <div className="flex items-center space-x-3 rounded-xl bg-white/10 p-3 backdrop-blur-md">
          <Building2 className="h-8 w-8 text-purple-200" />
          <div>
            <p className="text-xs text-purple-200 uppercase">Tổng số nhà xe</p>
            <p className="text-2xl font-extrabold">{pagination.total}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Sort, Limit */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-center space-x-2"
            >
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên nhà xe..."
                  className="pl-9 text-sm"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Tìm kiếm
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs"
                >
                  Xóa lọc
                </Button>
              )}
            </form>

            {/* Filter controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                <span>Sắp xếp:</span>
                <select
                  aria-label="Sắp xếp danh sách nhà xe"
                  onChange={handleSortChange}
                  value={
                    sortBy === "createdAt" && sortOrder === "desc"
                      ? "newest"
                      : sortBy === "createdAt" && sortOrder === "asc"
                        ? "oldest"
                        : sortBy === "name" && sortOrder === "asc"
                          ? "name_asc"
                          : "name_desc"
                  }
                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="newest">Ngày tạo: Mới nhất</option>
                  <option value="oldest">Ngày tạo: Cũ nhất</option>
                  <option value="name_asc">Tên nhà xe: A - Z</option>
                  <option value="name_desc">Tên nhà xe: Z - A</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                <span>Dòng/trang:</span>
                <select
                  aria-label="Số bản ghi trên mỗi trang"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchOperators}
                title="Làm mới"
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error View */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {/* Table Data Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-gray-900">
            Danh sách Nhà xe ({pagination.total})
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            {searchQuery
              ? `Kết quả tìm kiếm cho từ khóa "${searchQuery}"`
              : "Danh sách tất cả các đơn vị vận tải đã được phê duyệt"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3 p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm font-medium text-gray-600">
                Đang tải danh sách nhà xe...
              </p>
            </div>
          ) : operators.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center space-y-3 p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-300" />
              <p className="text-base font-semibold text-gray-700">
                {searchQuery
                  ? "Không tìm thấy nhà xe phù hợp với điều kiện tìm kiếm."
                  : "Chưa có nhà xe nào hoạt động trên hệ thống."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs"
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-y border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">STT</th>
                    <th className="px-6 py-3.5">Mã Nhà xe</th>
                    <th className="px-6 py-3.5">Tên Nhà xe</th>
                    <th className="px-6 py-3.5">Mã Chủ sở hữu (User ID)</th>
                    <th className="px-6 py-3.5">Ngày tham gia</th>
                    <th className="px-6 py-3.5">Ngày cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {operators.map((op, idx) => {
                    const stt =
                      (pagination.page - 1) * pagination.limit + idx + 1;
                    return (
                      <tr
                        key={op.id}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {stt}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800">
                            <Hash className="mr-1 h-3 w-3 text-gray-400" />
                            {op.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="rounded-lg bg-purple-50 p-1.5 text-purple-600">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900">
                              {op.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800">
                              <User className="mr-1 h-3 w-3 text-gray-400" />
                              {op.userId}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 border-purple-200 px-2 text-xs text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                              onClick={() =>
                                setSelectedUserForModal({
                                  userId: op.userId,
                                  operatorName: op.name,
                                })
                              }
                              title={`Xem chi tiết tài khoản chủ sở hữu nhà xe ${op.name}`}
                            >
                              <Eye className="h-3.5 w-3.5 text-purple-600" />
                              <span>Chi tiết</span>
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          <span className="inline-flex items-center">
                            <Calendar className="mr-1 h-3.5 w-3.5 text-gray-400" />
                            {op.getFormattedCreatedAt()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {op.getFormattedUpdatedAt()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-500">
                Trang{" "}
                <span className="font-semibold text-gray-800">
                  {pagination.page}
                </span>{" "}
                /{" "}
                <span className="font-semibold text-gray-800">
                  {pagination.totalPages}
                </span>{" "}
                (Tổng {pagination.total} nhà xe)
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Trước</span>
                </Button>

                <div className="flex space-x-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.page) <= 1
                      );
                    })
                    .map((p, index, array) => {
                      const prev = array[index - 1];
                      return (
                        <React.Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <span className="px-2 text-xs text-gray-400">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              p === pagination.page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(p)}
                            className={`h-8 w-8 p-0 text-xs ${
                              p === pagination.page
                                ? "bg-purple-600 text-white"
                                : ""
                            }`}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  className="gap-1 text-xs"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal xem chi tiết người dùng sở hữu nhà xe */}
      <AdminUserDetailModal
        open={Boolean(selectedUserForModal)}
        userId={selectedUserForModal?.userId || null}
        operatorName={selectedUserForModal?.operatorName}
        roleBadge="Nhà xe"
        onClose={() => setSelectedUserForModal(null)}
      />
    </div>
  );
};
