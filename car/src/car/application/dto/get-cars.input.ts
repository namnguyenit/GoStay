import { CarType } from '../../domain/value-object/car-type.enum';

export interface GetCarsInput {
  userId: string;
  keyword?: string;
  type?: CarType;
  sortBy?: 'createdAt' | 'name' | 'totalSeats';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
