import { Car as PrismaCarModel, CarType as PrismaCarType, CarStatus as PrismaCarStatus } from '@prisma/client';
import { Car } from '../../domain/entity/car.entity';
import { CarType } from '../../domain/value-object/car-type.enum';
import { CarStatus } from '../../domain/value-object/car-status.enum';
import { LicensePlate } from '../../domain/value-object/license-plate.vo';

export class CarMapper {
  public static toDomain(model: PrismaCarModel): Car {
    return Car.reconstruct({
      id: model.id,
      operatorId: model.operatorId,
      name: model.name,
      type: model.type as unknown as CarType,
      status: model.status as unknown as CarStatus,
      licensePlate: new LicensePlate(model.licensePlate),
      totalSeats: model.totalSeats,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  public static toPersistence(entity: Car) {
    return {
      id: entity.id,
      operatorId: entity.operatorId,
      name: entity.name,
      type: entity.type as unknown as PrismaCarType,
      status: entity.status as unknown as PrismaCarStatus,
      licensePlate: entity.licensePlate.getValue(),
      totalSeats: entity.totalSeats,
    };
  }
}
