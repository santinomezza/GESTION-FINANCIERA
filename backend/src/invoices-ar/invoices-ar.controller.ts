import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { InvoicesArService } from './invoices-ar.service';
import { CreateManualInvoiceDto } from './dto/create-manual-invoice.dto';
import { ActiveWorkspaceId } from '../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { WorkspaceMemberRole } from '@prisma/client';

interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

@ApiTags('Invoices AR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@ApiHeader({
    name: 'x-workspace-id',
    description: 'ID del workspace activo',
    required: true,
})
@Controller('invoices-ar')
export class InvoicesArController {
    constructor(private readonly invoicesArService: InvoicesArService) {}

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Subir factura PDF/IMG y extraer datos con IA' })
    async uploadInvoice(@ActiveWorkspaceId() workspaceId: string, @UploadedFile() file: UploadedFile) {
        if (!file) {
            throw new Error('Archivo requerido');
        }
        return await this.invoicesArService.processInvoiceOCR(workspaceId, file.buffer, file.originalname, file.mimetype);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Post('manual')
    @ApiOperation({ summary: 'Crear factura manualmente sin archivo' })
    createManual(@ActiveWorkspaceId() workspaceId: string, @Body() dto: CreateManualInvoiceDto) {
        return this.invoicesArService.createManual(workspaceId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar facturas del usuario' })
    findAll(@ActiveWorkspaceId() workspaceId: string) {
        return this.invoicesArService.findAll(workspaceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener factura por ID' })
    findOne(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
        return this.invoicesArService.findOne(workspaceId, id);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Patch(':id/estado')
    @ApiOperation({ summary: 'Actualizar estado de pago' })
    updateEstado(
        @ActiveWorkspaceId() workspaceId: string,
        @Param('id') id: string,
        @Body('estado') estado: 'pendiente' | 'pagada' | 'parcial' | 'vencida'
    ) {
        return this.invoicesArService.updateEstado(workspaceId, id, estado);
    }

    @Roles(WorkspaceMemberRole.ADMIN)
  @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar factura' })
    remove(@ActiveWorkspaceId() workspaceId: string, @Param('id') id: string) {
        return this.invoicesArService.remove(workspaceId, id);
    }

    @Get('export/csv')
    @ApiOperation({ summary: 'Exportar facturas a CSV' })
    async exportCSV(@ActiveWorkspaceId() workspaceId: string, @Res() res: Response) {
        const csvContent = await this.invoicesArService.exportCSV(workspaceId);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=facturas.csv');
        res.send(csvContent);
    }
}