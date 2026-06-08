import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class TrackEventDto {
  @IsString()
  eventType: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsUUID()
  landmarkId?: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
