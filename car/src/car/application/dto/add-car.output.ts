import { CarType } from '../../domain/value-object/car-type.enum';
import { CarStatus } from '../../domain/value-object/car-status.enum';

export interface AddCarOutput {
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
