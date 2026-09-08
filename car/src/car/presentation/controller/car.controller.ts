import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CreateCarDto } from '../dto/create-car.dto';
import { GetCarsQueryDto } from '../dto/get-cars-query.dto';
import type { IAddCarUseCase } from '../../application/port/add-car.usecase.interface';
import type { IGetCarsUseCase } from '../../application/port/get-cars.usecase.interface';
import { CarPresentationMapper } from '../mapper/car-presentation.mapper';

@Controller('cars')
export class CarController {
  constructor(
    @Inject('IAddCarUseCase')
    private readonly addCarUseCase: IAddCarUseCase,
    @Inject('IGetCarsUseCase')
    private readonly getCarsUseCase: IGetCarsUseCase,
  ) {}

  @Post()
  async addCar(
    @Body() dto: CreateCarDto,
    @Headers('x-user-id') headerUserId?: string,
    @Body('userId') bodyUserId?: string,
  ) {
    const userId = headerUserId || bodyUserId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin định danh người dùng (x-user-id header).');
    }

    const input = CarPresentationMapper.toAddCarInput(dto, userId);
    const result = await this.addCarUseCase.execute(input);
    return CarPresentationMapper.toAddCarApiResponse(result);
  }

  @Get()
  async getCars(
    @Query() query: GetCarsQueryDto,
    @Headers('x-user-id') headerUserId?: string,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = headerUserId || queryUserId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin định danh người dùng (x-user-id header).');
    }

    const input = CarPresentationMapper.toGetCarsInput(query, userId);
    const result = await this.getCarsUseCase.execute(input);
    return CarPresentationMapper.toGetCarsApiResponse(result);
  }
}
