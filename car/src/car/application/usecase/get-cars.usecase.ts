import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IGetCarsUseCase } from '../port/get-cars.usecase.interface';
import { GetCarsInput } from '../dto/get-cars.input';
import { GetCarsOutput } from '../dto/get-cars.output';
import type { ICarRepository } from '../../domain/repository/car.repository.interface';

@Injectable()
export class GetCarsUseCase implements IGetCarsUseCase {
  constructor(
    @Inject('ICarRepository')
    private readonly carRepository: ICarRepository,
  ) {}

  async execute(input: GetCarsInput): Promise<GetCarsOutput> {
    if (!input.userId || !input.userId.trim()) {
      throw new BadRequestException('Vui lòng cung cấp mã người dùng (userId).');
    }

    // 1. Kiểm tra / lấy Operator ID của User
    let operatorId = await this.carRepository.findOperatorIdByUserId(input.userId);
    if (!operatorId) {
      operatorId = await this.carRepository.ensureDefaultOperatorExists(input.userId);
    }

    // 2. Chuẩn hóa phân trang & sắp xếp mặc định
    const page = Math.max(1, input.page || 1);
    const limit = Math.max(1, Math.min(100, input.limit || 10));
    const sortBy = input.sortBy || 'createdAt';
    const sortOrder = input.sortOrder || 'desc';

    // 3. Thực thi query lấy danh sách & thống kê KPI từ Repository
    const queryResult = await this.carRepository.findManyWithFilters({
      operatorId,
      keyword: input.keyword,
      type: input.type,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    const totalPages = Math.ceil(queryResult.total / limit) || 1;

    // 4. Map kết quả trả về DTO
    return {
      kpi: queryResult.kpi,
      pagination: {
        page,
        limit,
        totalItems: queryResult.total,
        totalPages,
      },
      data: queryResult.cars.map((car) => ({
        id: car.id!,
        operatorId: car.operatorId,
        name: car.name,
        type: car.type,
        status: car.status,
        licensePlate: car.licensePlate.getValue(),
        totalSeats: car.totalSeats,
        createdAt: car.createdAt!,
        updatedAt: car.updatedAt!,
      })),
    };
  }
}
