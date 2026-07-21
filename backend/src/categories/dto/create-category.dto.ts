import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsHexColor } from 'class-validator';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ required: false })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiProperty({ enum: CategoryType, required: false })
  @IsIn(Object.values(CategoryType))
  @IsOptional()
  type?: CategoryType;
}