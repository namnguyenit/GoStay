import { CreateCarDto } from '../dto/create-car.dto';
import { GetCarsQueryDto } from '../dto/get-cars-query.dto';
import { AddCarInput } from '../../application/dto/add-car.input';
import { AddCarOutput } from '../../application/dto/add-car.output';
import { GetCarsInput } from '../../application/dto/get-cars.input';
import { GetCarsOutput } from '../../application/dto/get-cars.output';

export class CarPresentationMapper {
  public static toAddCarInput(dto: CreateCarDto, userId: string): AddCarInput {
    return {
      userId,
      name: dto.name,
      type: dto.type,
      licensePlate: dto.licensePlate,
      totalSeats: dto.totalSeats,
    };
  }

  public static toAddCarApiResponse(output: AddCarOutput) {
    return {
      success: true,
      code: 'ADD_CAR_SUCCESS',
      message: 'Thêm xe mới thành công!',
      data: {
        id: output.id,
        operatorId: output.operatorId,
        name: output.name,
        type: output.type,
        status: output.status,
        licensePlate: output.licensePlate,
        totalSeats: output.totalSeats,
        createdAt: output.createdAt,
        updatedAt: output.updatedAt,
      },
    };
  }

  public static toGetCarsInput(query: GetCarsQueryDto, userId: string): GetCarsInput {
    return {
      userId,
      keyword: query.keyword,
      type: query.type,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    };
  }

  public static toGetCarsApiResponse(output: GetCarsOutput) {
    return {
      success: true,
      code: 'GET_CARS_SUCCESS',
      message: 'Lấy danh sách xe thành công.',
      data: {
        kpi: output.kpi,
        pagination: output.pagination,
        data: output.data,
      },
    };
  }
}
