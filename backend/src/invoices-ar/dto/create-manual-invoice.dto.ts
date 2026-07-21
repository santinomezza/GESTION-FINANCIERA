import { IsString, IsOptional, IsDecimal, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateManualInvoiceDto {
    @IsString()
    nro_factura: string;

    @IsDateString()
    fecha: string;

    @IsString()
    razon_social: string;

    @IsString()
    cuit: string;

    @IsDecimal()
    @Type(() => Number)
    importe_neto: number;

    @IsDecimal()
    @Type(() => Number)
    iva_21: number;

    @IsDecimal()
    @Type(() => Number)
    total: number;

    @IsEnum(['pendiente', 'pagada', 'parcial', 'vencida'])
    estado_pago: string;
}