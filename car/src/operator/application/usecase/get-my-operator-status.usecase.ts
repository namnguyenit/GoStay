import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IGetMyOperatorStatusUseCase } from '../port/get-my-operator-status.usecase.interface';
import { GetMyOperatorStatusInput } from '../dto/get-my-operator-status.input';
import { GetMyOperatorStatusOutput } from '../dto/get-my-operator-status.output';
import type { IOperatorRepository } from '../../domain/repository/operator.repository.interface';
import type { IOperatorApplicationRepository } from '../../domain/repository/operator-application.repository.interface';

@Injectable()
export class GetMyOperatorStatusUseCase implements IGetMyOperatorStatusUseCase {
  constructor(
    @Inject('IOperatorRepository')
    private readonly operatorRepo: IOperatorRepository,
    @Inject('IOperatorApplicationRepository')
    private readonly applicationRepo: IOperatorApplicationRepository,
  ) {}

  async execute(input: GetMyOperatorStatusInput): Promise<GetMyOperatorStatusOutput> {
    if (!input.userId || !input.userId.trim()) {
      throw new BadRequestException('Vui lòng cung cấp mã người dùng (userId).');
    }

    // 1. Kiểm tra tài khoản người dùng đã có trong danh sách Nhà xe (Operator) chưa
    const operator = await this.operatorRepo.findByUserId(input.userId);
    const isOperator = !!operator;

    // 2. Lấy đơn đăng ký mới nhất của người dùng
    const latestApp = await this.applicationRepo.findLatestByUserId(input.userId);

    return {
      isOperator,
      operator: operator
        ? {
            id: operator.id!,
            userId: operator.userId,
            name: operator.name,
            createdAt: operator.createdAt!,
            updatedAt: operator.updatedAt!,
          }
        : undefined,
      latestApplication: latestApp
        ? {
            id: latestApp.id!,
            userId: latestApp.userId,
            name: latestApp.name,
            phone: latestApp.phone.getValue(),
            address: latestApp.address,
            status: latestApp.status,
            rejectReason: latestApp.rejectReason,
            createdAt: latestApp.createdAt!,
            updatedAt: latestApp.updatedAt!,
          }
        : undefined,
    };
  }
}
