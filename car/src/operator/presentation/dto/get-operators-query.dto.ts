import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOperatorsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'name'], { message: 'SortBy phải là createdAt hoặc name.' })
  sortBy?: 'createdAt' | 'name';

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
