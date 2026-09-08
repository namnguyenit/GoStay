import { CarType } from '../../domain/value-object/car-type.enum';
import { CarStatus } from '../../domain/value-object/car-status.enum';

export interface CarItemOutput {
  id: string;
  operatorId: string;
  name: string;
  type: CarType;
  status: CarStatus;
  licensePlate: string;
  totalSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetCarsOutput {
  kpi: {
    totalCars: number;
    sleeperCars: number;
    limousineCars: number;
    seatCars: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  data: CarItemOutput[];
}
