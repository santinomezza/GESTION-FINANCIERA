import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { WorkspaceType } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEnum(WorkspaceType)
  type: WorkspaceType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
