import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceType } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'juan@ejemplo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'miPassword123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'PERSONAL', required: false })
  @IsOptional()
  @IsEnum(['PERSONAL', 'BUSINESS'])
  workspaceType?: 'PERSONAL' | 'BUSINESS';

  @ApiProperty({ example: 'Mi Negocio', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  workspaceName?: string;
}
