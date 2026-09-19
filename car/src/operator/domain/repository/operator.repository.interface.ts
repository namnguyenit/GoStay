import { Operator } from '../entity/operator.entity';

export interface OperatorFilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface OperatorListQueryResult {
  operators: Operator[];
  total: number;
}

export interface IOperatorRepository {
  save(operator: Operator): Promise<Operator>;
  findByUserId(userId: string): Promise<Operator | null>;
  findById(id: string): Promise<Operator | null>;
  findAll(params?: OperatorFilterParams): Promise<OperatorListQueryResult>;
}
