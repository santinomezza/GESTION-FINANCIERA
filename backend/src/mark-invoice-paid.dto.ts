import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class MarkInvoicePaidDto {
    @ApiProperty({
        description: 'La fecha en que se recibió el pago de la factura. Si no se envía se usa la fecha actual.',
        example: '2026-07-15T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    paymentDate?: Date;
}