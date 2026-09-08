import { Injectable } from '@nestjs/common';
import { ICarRepository } from '../../domain/repository/car.repository.interface';
import { Car } from '../../domain/entity/car.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { CarMapper } from '../mapper/car.mapper';

@Injectable()
export class PrismaCarRepository implements ICarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(car: Car): Promise<Car> {
    const rawData = CarMapper.toPersistence(car);

    const savedModel = await this.prisma.car.upsert({
      where: { id: rawData.id || '' },
      create: {
        operatorId: rawData.operatorId,
        name: rawData.name,
        type: rawData.type,
        status: rawData.status,
        licensePlate: rawData.licensePlate,
        totalSeats: rawData.totalSeats,
      },
      update: {
        name: rawData.name,
        type: rawData.type,
        status: rawData.status,
        licensePlate: rawData.licensePlate,
        totalSeats: rawData.totalSeats,
      },
    });

    return CarMapper.toDomain(savedModel);
  }

  async findByLicensePlate(licensePlate: string): Promise<Car | null> {
    const normalizedPlate = licensePlate.trim().toUpperCase();
    const model = await this.prisma.car.findUnique({
      where: { licensePlate: normalizedPlate },
    });

    if (!model) {
      return null;
    }

    return CarMapper.toDomain(model);
  }

  async findById(id: string): Promise<Car | null> {
    const model = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!model) {
      return null;
    }

    return CarMapper.toDomain(model);
  }

  async findOperatorIdByUserId(userId: string): Promise<string | null> {
    const operator = await this.prisma.operator.findFirst({
      where: { userId },
    });

    return operator ? operator.id : null;
  }

  async ensureDefaultOperatorExists(userId: string): Promise<string> {
    let operator = await this.prisma.operator.findFirst({
      where: { userId },
    });

    if (!operator) {
      operator = await this.prisma.operator.create({
        data: {
          userId,
          name: `Nhà xe của ${userId}`,
        },
      });
    }

    return operator.id;
  }
}
