import { Inject, Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { ICreateOperatorApplicationUseCase } from '../port/create-operator-application.usecase.interface';
import { CreateOperatorApplicationInput } from '../dto/create-operator-application.input';
import { CreateOperatorApplicationOutput } from '../dto/create-operator-application.output';
import type { IOperatorApplicationRepository } from '../../domain/repository/operator-application.repository.interface';
import type { IOperatorRepository } from '../../domain/repository/operator.repository.interface';
import { OperatorApplication } from '../../domain/entity/operator-application.entity';
import { PhoneNumber } from '../../domain/value-object/phone-number.vo';

@Injectable()
export class CreateOperatorApplicationUseCase implements ICreateOperatorApplicationUseCase {
  constructor(
    @Inject('IOperatorApplicationRepository')
    private readonly repository: IOperatorApplicationRepository,
    @Inject('IOperatorRepository')
    private readonly operatorRepository: IOperatorRepository,
  ) {}

  async execute(input: CreateOperatorApplicationInput): Promise<CreateOperatorApplicationOutput> {
    if (!input.userId || !input.userId.trim()) {
      throw new BadRequestException('Vui lòng cung cấp mã người dùng (userId).');
    }

    // 1. Kiểm tra xem người dùng đã là Nhà xe (Operator) chính thức chưa
    const existingOperator = await this.operatorRepository.findByUserId(input.userId);
    if (existingOperator) {
      throw new ConflictException(
        'Tài khoản của bạn đã được phê duyệt trở thành Nhà xe (Operator). Không thể gửi thêm đơn đăng ký mới.',
      );
    }

    // 2. Kiểm tra nếu đã có đơn đăng ký đang chờ duyệt (PENDING)
    const existingPendingApp = await this.repository.findPendingByUserId(input.userId);
    if (existingPendingApp) {
      throw new ConflictException('Bạn đã có đơn đăng ký đang chờ Admin phê duyệt. Vui lòng chờ kết quả xử lý.');
    }

    // 3. Validate định dạng SĐT Việt Nam
    let phoneVo: PhoneNumber;
    try {
      phoneVo = new PhoneNumber(input.phone);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // 4. Khởi tạo Domain Entity
    let entity: OperatorApplication;
    try {
      entity = OperatorApplication.create({
        userId: input.userId,
        name: input.name,
        phone: phoneVo,
        address: input.address,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // 5. Lưu vào CSDL
    const saved = await this.repository.save(entity);

    // 6. Trả về Output DTO
    return {
      id: saved.id!,
      userId: saved.userId,
      name: saved.name,
      phone: saved.phone.getValue(),
      address: saved.address,
      status: saved.status,
      createdAt: saved.createdAt!,
      updatedAt: saved.updatedAt!,
    };
  }
}
