import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CategoryMode {
  ALL = 'ALL',
  STAY = 'STAY',
  EXP = 'EXP',
  SVC = 'SVC',
}

export enum SortMode {
  DISTANCE = 'DISTANCE',
  RATING = 'RATING',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  RELEVANCE = 'RELEVANCE',
}

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  locationQuery?: string;

  @IsOptional()
  @IsString()
  landmarkId?: string;

  @IsOptional()
  @IsEnum(CategoryMode)
  category?: CategoryMode = CategoryMode.ALL;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  minLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  maxLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  minLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  maxLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  // New Filters
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsString()
  amenities?: string; // Comma separated

  @IsOptional()
  @IsEnum(SortMode)
  sortBy?: SortMode = SortMode.DISTANCE;
}
