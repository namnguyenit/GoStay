import { Module } from '@nestjs/common';
import { CarController } from './presentation/controller/car.controller';
import { AddCarUseCase } from './application/usecase/add-car.usecase';
import { PrismaCarRepository } from './infrastructure/repository/prisma-car.repository';

@Module({
  controllers: [CarController],
  providers: [
    {
      provide: 'ICarRepository',
      useClass: PrismaCarRepository,
    },
    {
      provide: 'IAddCarUseCase',
      useClass: AddCarUseCase,
    },
  ],
  exports: ['ICarRepository', 'IAddCarUseCase'],
})
export class CarModule {}
