import { CreateCarDto } from '../dto/create-car.dto';
import { AddCarInput } from '../../application/dto/add-car.input';
import { AddCarOutput } from '../../application/dto/add-car.output';

export class CarPresentationMapper {
  public static toInput(dto: CreateCarDto, userId: string): AddCarInput {
    return {
      userId,
      name: dto.name,
      type: dto.type,
      licensePlate: dto.licensePlate,
      totalSeats: dto.totalSeats,
    };
  }

  public static toApiResponse(output: AddCarOutput) {
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
}
