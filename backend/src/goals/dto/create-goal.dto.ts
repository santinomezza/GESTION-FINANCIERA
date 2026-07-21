import { IsString, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  targetAmount: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  targetDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  targetAmount?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  targetDate?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
