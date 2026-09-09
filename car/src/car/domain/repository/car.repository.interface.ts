import { Car } from '../entity/car.entity';
import { CarType } from '../value-object/car-type.enum';

export interface CarFilterParams {
  operatorId: string;
  keyword?: string;
  type?: CarType;
  sortBy?: 'createdAt' | 'name' | 'totalSeats';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CarListQueryResult {
  cars: Car[];
  total: number;
  kpi: {
    totalCars: number;
    sleeperCars: number;
    limousineCars: number;
    seatCars: number;
  };
}

export interface ICarRepository {
  save(car: Car): Promise<Car>;
  findByLicensePlate(licensePlate: string): Promise<Car | null>;
  findById(id: string): Promise<Car | null>;
  findOperatorIdByUserId(userId: string): Promise<string | null>;
  findManyWithFilters(params: CarFilterParams): Promise<CarListQueryResult>;
}
