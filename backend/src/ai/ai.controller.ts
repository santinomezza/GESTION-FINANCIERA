import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { IsString } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('extract-invoice')
  @ApiOperation({ summary: 'Extraer datos de factura desde imagen/PDF con IA' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async extractInvoice(
    @UploadedFile() file: UploadedFile,
  ) {
    if (!file) {
      throw new Error('Archivo de factura requerido');
    }
    return this.aiService.extractInvoice(file.buffer, file.mimetype);
  }
}