import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class MarkInvoicePaidDto {
    @ApiProperty({
        description: 'La fecha en que se recibió el pago de la factura.',
        example: '2026-07-15T00:00:00.000Z',
    })
    @IsDateString()
    @IsNotEmpty()
    paymentDate: Date;
}