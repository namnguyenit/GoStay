import {
  Controller,
  Post,
  Body,
  Headers,
  Inject,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { CreateCarDto } from '../dto/create-car.dto';
import type { IAddCarUseCase } from '../../application/port/add-car.usecase.interface';
import { CarPresentationMapper } from '../mapper/car-presentation.mapper';

@Controller('cars')
export class CarController {
  constructor(
    @Inject('IAddCarUseCase')
    private readonly addCarUseCase: IAddCarUseCase,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async addCar(
    @Body() dto: CreateCarDto,
    @Headers('x-user-id') headerUserId?: string,
    @Body('userId') bodyUserId?: string,
  ) {
    const userId = headerUserId || bodyUserId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin định danh người dùng (x-user-id header).');
    }

    const input = CarPresentationMapper.toInput(dto, userId);
    const result = await this.addCarUseCase.execute(input);
    return CarPresentationMapper.toApiResponse(result);
  }
}
