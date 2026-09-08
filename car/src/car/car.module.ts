import { Module } from '@nestjs/common';
import { CarController } from './presentation/controller/car.controller';
import { AddCarUseCase } from './application/usecase/add-car.usecase';
import { GetCarsUseCase } from './application/usecase/get-cars.usecase';
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
    {
      provide: 'IGetCarsUseCase',
      useClass: GetCarsUseCase,
    },
  ],
  exports: ['ICarRepository', 'IAddCarUseCase', 'IGetCarsUseCase'],
})
export class CarModule {}
