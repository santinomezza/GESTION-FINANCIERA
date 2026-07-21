"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InvoicesArService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesArService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const argentina_helpers_1 = require("./helpers/argentina-helpers");
const fs = require("fs");
const path = require("path");
let InvoicesArService = InvoicesArService_1 = class InvoicesArService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(InvoicesArService_1.name);
        this.uploadsDir = path.join(process.cwd(), 'uploads');
    }
    async processInvoiceOCR(userId, fileBuffer, originalName, mimeType) {
        const extracted = await this.aiService.extractInvoice(fileBuffer, mimeType);
        if (!extracted.total || extracted.total <= 0) {
            throw new Error('No se pudieron extraer datos válidos de la factura');
        }
        const fechaEmision = (0, argentina_helpers_1.parsearFechaArg)(extracted.fecha) || new Date().toISOString().split('T')[0];
        const cuit = extracted.cuit || null;
        let clienteId;
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
        const tipo = (0, argentina_helpers_1.clasificarComprobante)(extracted.numeroTicket) || 'B';
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
                subtotal: extracted.neto ? (0, argentina_helpers_1.parseNum)(extracted.neto) : null,
                iva: extracted.ivaMonto ? (0, argentina_helpers_1.parseNum)(extracted.ivaMonto) : null,
                importeTotal: (0, argentina_helpers_1.parseNum)(extracted.total),
                condicionFiscal: (0, argentina_helpers_1.validarCUIT)(cuit) ? 'Responsable Inscripto' : null,
                descripcion: `Proveedor: ${razonSocial || ''}` + (cuit ? ` | CUIT: ${cuit}` : ''),
                estadoPago: 'pendiente',
                urlArchivo: clientFilePath,
            }
        });
        return { success: true, message: 'Factura procesada correctamente', factura, extracted };
    }
    async createManual(userId, dto) {
        const cliente = await this.prisma.argClient.findFirst({
            where: { userId, cuit: dto.cuit }
        });
        let clienteId;
        if (!cliente) {
            const newCliente = await this.prisma.argClient.create({
                data: { userId, cuit: dto.cuit, razonSocial: dto.razon_social, email: null, telefono: null, direccion: null }
            });
            clienteId = newCliente.id;
        }
        else {
            clienteId = cliente.id;
        }
        const tipo = (0, argentina_helpers_1.clasificarComprobante)(dto.nro_factura) || 'B';
        return await this.prisma.argInvoice.create({
            data: {
                userId,
                clienteId,
                nroFactura: dto.nro_factura,
                tipo,
                fechaEmision: new Date(dto.fecha),
                subtotal: (0, argentina_helpers_1.parseNum)(dto.importe_neto),
                iva: (0, argentina_helpers_1.parseNum)(dto.iva_21),
                importeTotal: (0, argentina_helpers_1.parseNum)(dto.total),
                estadoPago: dto.estado_pago,
            }
        });
    }
    async findAll(userId) {
        return await this.prisma.argInvoice.findMany({
            where: { userId },
            include: { cliente: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(userId, id) {
        const factura = await this.prisma.argInvoice.findFirst({
            where: { id, userId },
            include: { cliente: true }
        });
        if (!factura) {
            throw new common_1.NotFoundException('Factura no encontrada');
        }
        return factura;
    }
    async updateEstado(userId, id, estadoPago) {
        await this.findOne(userId, id);
        return await this.prisma.argInvoice.update({
            where: { id },
            data: { estadoPago }
        });
    }
    async remove(userId, id) {
        const factura = await this.findOne(userId, id);
        if (factura.urlArchivo && fs.existsSync(factura.urlArchivo)) {
            fs.unlinkSync(factura.urlArchivo);
        }
        return await this.prisma.argInvoice.delete({
            where: { id }
        });
    }
    async exportCSV(userId) {
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
};
exports.InvoicesArService = InvoicesArService;
exports.InvoicesArService = InvoicesArService = InvoicesArService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], InvoicesArService);
//# sourceMappingURL=invoices-ar.service.js.map