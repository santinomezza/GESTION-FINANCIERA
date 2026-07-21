import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { TransactionType, PaymentMethod, TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ enum: TransactionType })
  @IsIn(Object.values(TransactionType))
  type: TransactionType;

  @ApiProperty({ required: false, description: 'ID de la categoría existente' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Nombre de la categoría (se crea si no existe)' })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsIn(Object.values(PaymentMethod))
  paymentMethod?: PaymentMethod;

  @ApiProperty({ enum: TransactionStatus, required: false, default: 'CONFIRMED' })
  @IsOptional()
  @IsIn(Object.values(TransactionStatus))
  status?: TransactionStatus;

  @ApiProperty({ required: false, default: 'web' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telegramMsgId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goalId?: string;
}