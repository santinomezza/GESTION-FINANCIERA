import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, UploadedFile, UseInterceptors, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './create-invoice.dto';
import { UpdateInvoiceDto } from './update-invoice.dto';
import { ActiveWorkspaceId } from './common/decorators/workspace.decorator';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { WorkspaceGuard } from './common/guards/workspace.guard';
import { Roles } from './common/decorators/roles.decorator';
import { RolesGuard } from './common/guards/roles.guard';
import { BusinessWorkspaceGuard } from './common/guards/business-workspace.guard';
import { MarkInvoicePaidDto } from './mark-invoice-paid.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './clients/clients.service';
import { TransactionType, WorkspaceMemberRole } from '@prisma/client';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from './common/decorators/public.decorator';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@ApiTags('Invoices')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-workspace-id',
  description: 'ID del workspace activo',
  required: true,
})
@Controller('invoices')
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly clientsService: ClientsService,
    private config: ConfigService,
  ) { }

  @Get('file/:id')
  @Public()
  @ApiOperation({ summary: 'Obtener el archivo de una factura' })
  async getInvoiceFile(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findOnePublic(id);

    if (invoice.file) {
      res.setHeader('Content-Type', invoice.fileMimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.${(invoice.fileMimeType || '').split('/')[1] || 'bin'}"`);
      res.send(invoice.file);
      return;
    }

    res.status(404).json({ message: 'Archivo no encontrado' });
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  findAll(
    @ActiveWorkspaceId() workspaceId: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.invoicesService.findAll(workspaceId, clientId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  findOne(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(workspaceId, id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
  create(@ActiveWorkspaceId() workspaceId: string, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(workspaceId, createInvoiceDto);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
  update(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(workspaceId, id, updateInvoiceDto);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
  remove(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.invoicesService.remove(workspaceId, id);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post(':id/pay')
  @ApiOperation({ summary: 'Marcar una factura como pagada y crear la transacción de ingreso correspondiente.' })
  @UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
  markAsPaid(
    @ActiveWorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() markAsPaidDto: MarkInvoicePaidDto,
  ) {
    return this.invoicesService.markAsPaid(workspaceId, id, markAsPaidDto.paymentDate);
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post('upload')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir factura PDF/IMG y extraer datos con IA' })
  async uploadInvoice(@ActiveWorkspaceId() workspaceId: string, @UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new Error('Archivo requerido');
    }

    let extracted;
    try {
      extracted = await this.invoicesService.extractInvoiceData(file.buffer, file.mimetype);
    } catch (err: any) {
      this.logger.error('Error al extraer datos de factura:', err.message || err);
      throw new Error(err.message || 'Error al procesar la factura');
    }

    let clientId: string | undefined;
    if (extracted.cliente || extracted.razonSocial || extracted.cuit) {
      const clientName = extracted.razonSocial || extracted.cliente;
      if (clientName) {
        const existingClients = await this.clientsService.findAll(workspaceId);
        const existingClient = existingClients.find(
          (c) => c.cuit === extracted.cuit || c.name.toLowerCase() === clientName.toLowerCase()
        );
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const newClient = await this.clientsService.create(workspaceId, {
            name: clientName,
            cuit: extracted.cuit || undefined,
          });
          clientId = newClient.id;
        }
      }
    }

    const issueDate = extracted.fecha ? new Date(extracted.fecha + 'T00:00:00Z') : new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceNumber = extracted.numeroTicket || `IMP-${Date.now()}`;

    const invoice = await this.invoicesService.create(workspaceId, {
      invoiceNumber,
      issueDate,
      dueDate,
      totalAmount: extracted.total,
      status: 'PENDING',
      clientId: clientId || '',
      file: file.buffer,
      fileMimeType: file.mimetype,
    } as any);

    return { invoice, extracted, fileUrl: `/api/invoices/file/${invoice.id}` };
  }

  @Roles(WorkspaceMemberRole.ADMIN)
  @Post(':id/upload')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, BusinessWorkspaceGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivo a una factura existente' })
  async uploadInvoiceFile(
    @ActiveWorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @UploadedFile() file: UploadedFile,
  ) {
    await this.invoicesService.update(workspaceId, id, {
      file: file.buffer,
      fileMimeType: file.mimetype,
    } as any);

    return { fileUrl: `/api/invoices/file/${id}` };
  }
}
