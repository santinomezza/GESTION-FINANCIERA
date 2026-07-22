import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

const INVOICE_STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;
type InvoiceStatus = typeof INVOICE_STATUSES[number];

export class CreateInvoiceDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    invoiceNumber: string;

    @ApiProperty()
    @IsDateString()
    issueDate: Date;

    @ApiProperty()
    @IsDateString()
    dueDate: Date;

    @ApiProperty()
    @IsNumber()
    totalAmount: number;

    @ApiProperty({ enum: INVOICE_STATUSES, default: 'PENDING' })
    @IsString()
    @IsNotEmpty()
    @IsIn(INVOICE_STATUSES)
    status: InvoiceStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    clientId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    urlArchivo?: string;

    @ApiProperty({ required: false, type: 'string', format: 'binary' })
    @IsOptional()
    file?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fileMimeType?: string;
}