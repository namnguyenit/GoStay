import type { CarEntity } from "../../domain/entity/car.entity";
import type { CarType } from "../../domain/value-object/car-type.vo";

export interface CreateCarDTO {
  name: string;
  type: CarType;
  licensePlate: string;
  totalSeats: number;
}

export interface GetCarsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  type?: CarType | "";
  sortBy?: "createdAt" | "name" | "totalSeats";
  sortOrder?: "asc" | "desc";
}

export interface CarKpiMeta {
  totalCars: number;
  sleeperCars: number;
  limousineCars: number;
  seatCars: number;
}

export interface CarPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetCarsResult {
  data: CarEntity[];
  kpi: CarKpiMeta;
  pagination: CarPaginationMeta;
}

export interface ICarService {
  getCars(params?: GetCarsParams): Promise<GetCarsResult>;
  addCar(dto: CreateCarDTO): Promise<CarEntity>;
}
