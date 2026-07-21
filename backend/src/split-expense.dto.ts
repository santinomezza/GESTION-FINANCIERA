import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class PayerDto {
    @ApiProperty({ example: 'Santiago', description: 'Nombre de la persona' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 5000, description: 'Monto que pagó esta persona' })
    @IsNumber()
    @Min(0)
    amount: number;
}

export class SplitExpenseDto {
    @ApiProperty({ type: [PayerDto], description: 'Lista de personas y cuánto pagó cada una' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PayerDto)
    payers: PayerDto[];

    @ApiPropertyOptional({ example: 'Asado del domingo', description: 'Descripción del gasto (opcional)' })
    @IsOptional()
    @IsString()
    description?: string;
}
