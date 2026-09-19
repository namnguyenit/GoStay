import type { OperatorEntity } from "../../domain/entity/operator.entity";
import type { AdminUserDetailEntity } from "../../domain/entity/admin-user-detail.entity";

export interface GetOperatorsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetOperatorsResult {
  data: OperatorEntity[];
  pagination: PaginationMeta;
}

export interface IAdminOperatorService {
  getOperators(params?: GetOperatorsParams): Promise<GetOperatorsResult>;
  getUserDetailById(userId: string): Promise<AdminUserDetailEntity>;
}
