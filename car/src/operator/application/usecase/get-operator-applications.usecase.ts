import { Injectable, Inject } from '@nestjs/common';
import type { IGetOperatorApplicationsUseCase } from '../port/get-operator-applications.usecase.interface';
import { OperatorApplicationOutput } from '../dto/operator-application.output';
import type { IOperatorApplicationRepository } from '../../domain/repository/operator-application.repository.interface';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

@Injectable()
export class GetOperatorApplicationsUseCase implements IGetOperatorApplicationsUseCase {
  constructor(
    @Inject('IOperatorApplicationRepository')
    private readonly applicationRepo: IOperatorApplicationRepository,
  ) {}

  async execute(status?: OperatorApplicationStatus): Promise<OperatorApplicationOutput[]> {
    const list = await this.applicationRepo.findAll(status);
    return list.map((item) => ({
      id: item.id!,
      userId: item.userId,
      name: item.name,
      phone: item.phone.getValue(),
      address: item.address,
      status: item.status,
      rejectReason: item.rejectReason,
      createdAt: item.createdAt!,
      updatedAt: item.updatedAt!,
    }));
  }
}
