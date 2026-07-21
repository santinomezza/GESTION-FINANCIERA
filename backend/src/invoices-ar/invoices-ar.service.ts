import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiService, ExtractedInvoice } from '../ai/ai.service';
import { validarCUIT, clasificarComprobante, parsearFechaArg, parseNum } from './helpers/argentina-helpers';
import { CreateManualInvoiceDto } from './dto/create-manual-invoice.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesArService {
    private readonly logger = new Logger(InvoicesArService.name);
    private readonly uploadsDir = path.join(process.cwd(), 'uploads');

    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) {}

    async processInvoiceOCR(userId: string, fileBuffer: Buffer, originalName: string, mimeType: string) {
        const extracted = await this.aiService.extractInvoice(fileBuffer, mimeType);
        if (!extracted.total || extracted.total <= 0) {
            throw new Error('No se pudieron extraer datos válidos de la factura');
        }
        const fechaEmision = parsearFechaArg(extracted.fecha) || new Date().toISOString().split('T')[0];
        const cuit = extracted.cuit || null;
        let clienteId: string | undefined;
        const razonSocial = extracted.razonSocial || extracted.cliente;
        if (razonSocial) {
            let cliente = await this.prisma.argClient.findFirst({
                where: { userId, cuit: cuit || undefined, razonSocial: { equals: razonSocial, mode: 'insensitive' } }
            });
            if (!cliente) {
                cliente = await this.prisma.argClient.create({
                    data: { userId, cuit: cuit || '', razonSocial, email: null, telefono: null, direccion: null }
                });
            }
            clienteId = cliente.id;
        }
        const tipo = clasificarComprobante(extracted.numeroTicket) || 'B';
        const nroFactura = extracted.numeroTicket || `${Date.now()}`;
        const fileExt = path.extname(originalName) || '.pdf';
        const clienteDir = path.join(this.uploadsDir, 'clientes', cuit || 'sin_cuit');
        const fileName = `factura_${nroFactura}${fileExt}`;
        const clientFilePath = path.join(clienteDir, fileName);
        if (!fs.existsSync(clienteDir)) {
            fs.mkdirSync(clienteDir, { recursive: true });
        }
        fs.writeFileSync(clientFilePath, fileBuffer);
        const factura = await this.prisma.argInvoice.create({
            data: {
                userId,
                clienteId,
                nroFactura,
                tipo,
                fechaEmision: new Date(fechaEmision),
                subtotal: extracted.neto ? parseNum(extracted.neto) : null,
                iva: extracted.ivaMonto ? parseNum(extracted.ivaMonto) : null,
                importeTotal: parseNum(extracted.total),
                condicionFiscal: validarCUIT(cuit) ? 'Responsable Inscripto' : null,
                descripcion: `Proveedor: ${razonSocial || ''}` + (cuit ? ` | CUIT: ${cuit}` : ''),
                estadoPago: 'pendiente',
                urlArchivo: clientFilePath,
            }
        });
        return { success: true, message: 'Factura procesada correctamente', factura, extracted };
    }

    async createManual(userId: string, dto: CreateManualInvoiceDto) {
        const cliente = await this.prisma.argClient.findFirst({
            where: { userId, cuit: dto.cuit }
        });
        let clienteId: string | undefined;
        if (!cliente) {
            const newCliente = await this.prisma.argClient.create({
                data: { userId, cuit: dto.cuit, razonSocial: dto.razon_social, email: null, telefono: null, direccion: null }
            });
            clienteId = newCliente.id;
        } else {
            clienteId = cliente.id;
        }
        const tipo = clasificarComprobante(dto.nro_factura) || 'B';
        return await this.prisma.argInvoice.create({
            data: {
                userId,
                clienteId,
                nroFactura: dto.nro_factura,
                tipo,
                fechaEmision: new Date(dto.fecha),
                subtotal: parseNum(dto.importe_neto),
                iva: parseNum(dto.iva_21),
                importeTotal: parseNum(dto.total),
                estadoPago: dto.estado_pago,
            }
        });
    }

    async findAll(userId: string) {
        return await this.prisma.argInvoice.findMany({
            where: { userId },
            include: { cliente: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(userId: string, id: string) {
        const factura = await this.prisma.argInvoice.findFirst({
            where: { id, userId },
            include: { cliente: true }
        });
        if (!factura) {
            throw new NotFoundException('Factura no encontrada');
        }
        return factura;
    }

    async updateEstado(userId: string, id: string, estadoPago: 'pendiente' | 'pagada' | 'parcial' | 'vencida') {
        await this.findOne(userId, id);
        return await this.prisma.argInvoice.update({
            where: { id },
            data: { estadoPago }
        });
    }

    async remove(userId: string, id: string) {
        const factura = await this.findOne(userId, id);
        if (factura.urlArchivo && fs.existsSync(factura.urlArchivo)) {
            fs.unlinkSync(factura.urlArchivo);
        }
        return await this.prisma.argInvoice.delete({
            where: { id }
        });
    }

    async exportCSV(userId: string): Promise<string> {
        const facturas = await this.findAll(userId);
        const headers = ['ID', 'Nro Factura', 'Tipo', 'Fecha Emisión', 'Cliente', 'CUIT', 'Subtotal', 'IVA', 'Total', 'Estado Pago'];
        const rows = facturas.map(f => [
            f.id,
            f.nroFactura,
            f.tipo,
            f.fechaEmision.toISOString().split('T')[0],
            f.cliente?.razonSocial || '',
            f.cliente?.cuit || '',
            f.subtotal?.toString() || '',
            f.iva?.toString() || '',
            f.importeTotal.toString(),
            f.estadoPago
        ]);
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        return csvContent;
    }
}