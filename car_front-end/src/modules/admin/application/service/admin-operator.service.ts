import type {
  IAdminOperatorService,
  GetOperatorsParams,
  GetOperatorsResult,
} from "../port/admin-operator.service.interface";
import { OperatorEntity } from "../../domain/entity/operator.entity";
import { AdminUserDetailEntity } from "../../domain/entity/admin-user-detail.entity";
import { tokenStorage } from "@/modules/auth/composition";

export class AdminOperatorService implements IAdminOperatorService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getOperators(params?: GetOperatorsParams): Promise<GetOperatorsResult> {
    const token = tokenStorage.getToken();
    const query = new URLSearchParams();

    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const res = await fetch(
      this.apiBaseUrl + "/api/v1/operators?" + query.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
      }
    );

    if (res.status === 403) {
      throw new Error(
        "Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên (Admin) mới có quyền truy cập."
      );
    }

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || "Không thể lấy danh sách nhà xe");
    }

    const json = await res.json();
    const items = (json.data || []).map(
      (item: any) => new OperatorEntity(item)
    );
    const pagination = json.pagination || {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: items.length,
      totalPages: 1,
    };

    return {
      data: items,
      pagination,
    };
  }

  async getUserDetailById(userId: string): Promise<AdminUserDetailEntity> {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    };

    // 1. Thử gọi trực tiếp endpoint /api/v1/admin/users/{userId}
    try {
      const res = await fetch(
        `${this.apiBaseUrl}/api/v1/admin/users/${userId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json.result || json;
        if (data && (data.id || data.username)) {
          return AdminUserDetailEntity.fromApiResponse(data);
        }
      }
    } catch {
      // Tiếp tục thử fallback
    }

    // 2. Thử gọi tìm kiếm /api/v1/admin/users?keyword={userId}
    try {
      const searchRes = await fetch(
        `${this.apiBaseUrl}/api/v1/admin/users?keyword=${encodeURIComponent(userId)}&size=20`,
        {
          method: "GET",
          headers,
        }
      );

      if (searchRes.ok) {
        const json = await searchRes.json();
        const content =
          json.data?.content || json.result?.content || json.content || [];
        const found = content.find(
          (u: any) => u.id === userId || u.username === userId
        );
        if (found) {
          return AdminUserDetailEntity.fromApiResponse(found);
        }
      }
    } catch {
      // Fallback không tìm thấy
    }

    throw new Error(
      `Không tìm thấy thông tin tài khoản người dùng với mã ID: ${userId}`
    );
  }
}
