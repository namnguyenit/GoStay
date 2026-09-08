import { Car } from '../entity/car.entity';

export interface ICarRepository {
  save(car: Car): Promise<Car>;
  findByLicensePlate(licensePlate: string): Promise<Car | null>;
  findById(id: string): Promise<Car | null>;
  findOperatorIdByUserId(userId: string): Promise<string | null>;
  ensureDefaultOperatorExists(userId: string): Promise<string>;
}
