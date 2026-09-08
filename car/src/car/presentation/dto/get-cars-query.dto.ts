import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CarType } from '../../domain/value-object/car-type.enum';

export class GetCarsQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(CarType, { message: 'Loại xe phải là SLEEPER, LIMOUSINE hoặc SEAT.' })
  type?: CarType;

  @IsOptional()
  @IsEnum(['createdAt', 'name', 'totalSeats'], { message: 'SortBy phải là createdAt, name hoặc totalSeats.' })
  sortBy?: 'createdAt' | 'name' | 'totalSeats';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'SortOrder phải là asc hoặc desc.' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên.' })
  @Min(1, { message: 'Trang tối thiểu là 1.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số dòng mỗi trang phải là số nguyên.' })
  @Min(1, { message: 'Số dòng tối thiểu là 1.' })
  @Max(100, { message: 'Số dòng tối đa là 100.' })
  limit?: number = 10;
}
