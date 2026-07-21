import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsArray, ValidateIf } from 'class-validator';

export class UpdateWorkspaceDto {
    @ApiProperty({ example: 'Mi nuevo nombre', description: 'Nuevo nombre del workspace', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @ApiProperty({ example: ['transactions', 'categories'], description: 'Herramientas habilitadas', required: false })
    @IsOptional()
    @IsArray()
    enabledFeatures?: string[];
}
