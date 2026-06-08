import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { CategoryMode } from '../search/search.dto';

export class CrossSellRequestDto {
  @IsString()
  sourceListingId: string;

  @IsString()
  sourceCategory: string;

  @IsString()
  checkIn: string;

  @IsString()
  checkOut: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  guests?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cartListingIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 5;
}

export class HomeFeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsEnum(CategoryMode)
  category?: CategoryMode = CategoryMode.ALL;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class NearbyRecommendationQueryDto {
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsLongitude()
  lng: number;

  @IsOptional()
  @IsEnum(CategoryMode)
  category?: CategoryMode = CategoryMode.ALL;
}
