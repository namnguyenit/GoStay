import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ICarRepository, CarFilterParams, CarListQueryResult } from '../../domain/repository/car.repository.interface';
import { Car } from '../../domain/entity/car.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { CarMapper } from '../mapper/car.mapper';
import { CarType } from '../../domain/value-object/car-type.enum';

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

  async findManyWithFilters(params: CarFilterParams): Promise<CarListQueryResult> {
    const { operatorId, keyword, type, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = params;

    // Build WHERE clause
    const where: Prisma.CarWhereInput = {
      operatorId,
    };

    if (type) {
      where.type = type as unknown as Prisma.EnumCarTypeFilter;
    }

    if (keyword && keyword.trim() !== '') {
      const trimmedKeyword = keyword.trim();
      where.OR = [
        { name: { contains: trimmedKeyword, mode: 'insensitive' } },
        { licensePlate: { contains: trimmedKeyword, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Execute queries concurrently for performance
    const [carModels, totalCount, kpiSleeper, kpiLimousine, kpiSeat] = await Promise.all([
      this.prisma.car.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.car.count({ where }),
      this.prisma.car.count({ where: { operatorId, type: CarType.SLEEPER as any } }),
      this.prisma.car.count({ where: { operatorId, type: CarType.LIMOUSINE as any } }),
      this.prisma.car.count({ where: { operatorId, type: CarType.SEAT as any } }),
    ]);

    const totalCars = kpiSleeper + kpiLimousine + kpiSeat;

    return {
      cars: carModels.map(CarMapper.toDomain),
      total: totalCount,
      kpi: {
        totalCars,
        sleeperCars: kpiSleeper,
        limousineCars: kpiLimousine,
        seatCars: kpiSeat,
      },
    };
  }
}
