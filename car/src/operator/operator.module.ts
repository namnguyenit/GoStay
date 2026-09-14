import { Module } from '@nestjs/common';
import { OperatorApplicationController } from './presentation/controller/operator-application.controller';
import { CreateOperatorApplicationUseCase } from './application/usecase/create-operator-application.usecase';
import { ProcessOperatorApplicationUseCase } from './application/usecase/process-operator-application.usecase';
import { GetOperatorApplicationsUseCase } from './application/usecase/get-operator-applications.usecase';
import { GetMyOperatorStatusUseCase } from './application/usecase/get-my-operator-status.usecase';
import { PrismaOperatorApplicationRepository } from './infrastructure/repository/prisma-operator-application.repository';
import { PrismaOperatorRepository } from './infrastructure/repository/prisma-operator.repository';

@Module({
  controllers: [OperatorApplicationController],
  providers: [
    {
      provide: 'IOperatorApplicationRepository',
      useClass: PrismaOperatorApplicationRepository,
    },
    {
      provide: 'IOperatorRepository',
      useClass: PrismaOperatorRepository,
    },
    {
      provide: 'ICreateOperatorApplicationUseCase',
      useClass: CreateOperatorApplicationUseCase,
    },
    {
      provide: 'IProcessOperatorApplicationUseCase',
      useClass: ProcessOperatorApplicationUseCase,
    },
    {
      provide: 'IGetOperatorApplicationsUseCase',
      useClass: GetOperatorApplicationsUseCase,
    },
    {
      provide: 'IGetMyOperatorStatusUseCase',
      useClass: GetMyOperatorStatusUseCase,
    },
  ],
  exports: [
    'IOperatorApplicationRepository',
    'IOperatorRepository',
    'ICreateOperatorApplicationUseCase',
    'IProcessOperatorApplicationUseCase',
    'IGetOperatorApplicationsUseCase',
    'IGetMyOperatorStatusUseCase',
  ],
})
export class OperatorModule {}
