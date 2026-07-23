import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ExtractedInvoice {
  fecha: string | null;
  cliente: string | null;
  cuit: string | null;
  razonSocial: string | null;
  numeroTicket: string | null;
  neto: number | null;
  ivaPorcentaje: number | null;
  ivaMonto: number | null;
  total: number | null;
  confidence: number;
  rawText: string;
}

export interface ParsedTransaction {
  type: 'EXPENSE' | 'INCOME' | null;
  amount: number | null;
  category: string | null;
  description: string | null;
  date: string;
  confidence: number;
  raw: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private geminiModel: any = null;

  constructor(private config: ConfigService) {
    const geminiKey = this.config.get('gemini.apiKey');
    if (geminiKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const gemini = new GoogleGenerativeAI(geminiKey);
        this.geminiModel = gemini.getGenerativeModel({ model: 'gemini-2.5-flash', temperature: 0.1 });
        this.logger.log('Google Gemini 2.5 Flash integrado correctamente');
      } catch (err) {
        this.logger.warn('Gemini no disponible:', err.message);
      }
    }
  }

  async extractInvoice(fileBuffer: Buffer, mimeType: string): Promise<ExtractedInvoice> {
    // Generar un hash del contenido para caché
    const crypto = require('crypto');
    const contentHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const cacheKey = `invoice_extraction:${contentHash}`;

    // Intentar obtener de caché primero
    const cached = await this.getCachedExtraction(cacheKey);
    if (cached) {
      this.logger.log('Datos de factura obtenidos de caché');
      return cached;
    }

    let result: ExtractedInvoice;

    // Intentar extracción local primero (sin límites)
    try {
      this.logger.log('Intentando extracción local...');
      result = await this.extractInvoiceLocally(fileBuffer, mimeType);
      this.logger.log('Extracción local exitosa');
    } catch (localError) {
      this.logger.warn('Extracción local falló, intentando con Gemini...', localError);

      // Si falla la extracción local y Gemini está disponible, usar Gemini
      if (!this.geminiModel) {
        throw new Error('No se pudo extraer datos de la factura. Verificá que la imagen sea clara y legible.');
      }

      result = await this.extractInvoiceWithGemini(fileBuffer, mimeType);
    }

    // Guardar en caché por 1 hora
    await this.setCachedExtraction(cacheKey, result, 3600);

    return result;
  }

  private async extractInvoiceLocally(fileBuffer: Buffer, mimeType: string): Promise<ExtractedInvoice> {
    let text = '';

    // Extraer texto según el tipo de archivo
    if (mimeType === 'application/pdf') {
      text = await this.extractTextFromPDF(fileBuffer);
    } else if (mimeType.startsWith('image/')) {
      text = await this.extractTextFromImage(fileBuffer);
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No se pudo extraer texto del documento');
    }

    this.logger.log(`Texto extraído (${text.length} caracteres)`);

    // Parsear el texto extraído
    return this.parseInvoiceText(text);
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      this.logger.error('Error parseando PDF:', error);
      throw new Error('No se pudo leer el PDF');
    }
  }

  private async extractTextFromImage(buffer: Buffer): Promise<string> {
    // Para imágenes, usar regex patterns comunes en facturas argentinas
    // ya que no tenemos OCR local sin dependencias adicionales
    const base64 = buffer.toString('base64');

    // Intentar usar Gemini con un prompt más específico y corto
    if (this.geminiModel) {
      try {
        const response = await this.geminiModel.generateContent([
          {
            text: 'Extrae el texto de esta imagen de factura. Solo devuelve el texto plano sin formato.',
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64,
            },
          },
        ]);
        return response.response.candidates[0]?.content?.parts[0]?.text || '';
      } catch (error) {
        this.logger.warn('Error en OCR con Gemini:', error);
      }
    }

    throw new Error('No se pudo extraer texto de la imagen');
  }

  private parseInvoiceText(text: string): ExtractedInvoice {
    const result: ExtractedInvoice = {
      fecha: null,
      cliente: null,
      cuit: null,
      razonSocial: null,
      numeroTicket: null,
      neto: null,
      ivaPorcentaje: null,
      ivaMonto: null,
      total: null,
      confidence: 0.7,
      rawText: text,
    };

    // Extraer fecha (formatos comunes: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
    const fechaPatterns = [
      /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/,
      /(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})/,
    ];
    for (const pattern of fechaPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.fecha = this.parseDate(match[1]);
        break;
      }
    }

    // Extraer CUIT (formato: XX-XXXXXXXX-X)
    const cuitMatch = text.match(/(\d{2}[-\s]?\d{8}[-\s]?\d{1})/);
    if (cuitMatch) {
      result.cuit = cuitMatch[1].replace(/\s/g, '-');
    }

    // Extraer número de factura (patrones comunes)
    const numeroPatterns = [
      /(?:N°|Nº|Numero|Número|Factura|Comprobante)[:\s]*([A-Z0-9\-]+)/i,
      /(\d{4}[-\s]\d{8})/,
    ];
    for (const pattern of numeroPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.numeroTicket = match[1].trim();
        break;
      }
    }

    // Extraer montos
    const amountPatterns = {
      total: /(?:Total|TOTAL|Importe Total|Monto Total)[:\s]*\$?\s*([\d.,]+)/i,
      neto: /(?:Neto|NETO|Subtotal|SUBTOTAL)[:\s]*\$?\s*([\d.,]+)/i,
      iva: /(?:IVA|I\.V\.A\.)[:\s]*\$?\s*([\d.,]+)/i,
    };

    // Extraer total
    const totalMatch = text.match(amountPatterns.total);
    if (totalMatch) {
      result.total = this.parseAmount(totalMatch[1]);
    }

    // Extraer neto
    const netoMatch = text.match(amountPatterns.neto);
    if (netoMatch) {
      result.neto = this.parseAmount(netoMatch[1]);
    }

    // Extraer IVA
    const ivaMatch = text.match(amountPatterns.iva);
    if (ivaMatch) {
      result.ivaMonto = this.parseAmount(ivaMatch[1]);
      result.ivaPorcentaje = 21; // IVA argentino por defecto
    }

    // Si no hay neto pero hay total y IVA, calcular neto
    if (!result.neto && result.total && result.ivaMonto) {
      result.neto = result.total - result.ivaMonto;
    }

    // Si hay total pero no hay IVA, asumir IVA 21%
    if (result.total && !result.ivaMonto && !result.neto) {
      result.neto = result.total / 1.21;
      result.ivaMonto = result.total - result.neto;
      result.ivaPorcentaje = 21;
    }

    // Extraer razón social (después de CUIT o en líneas con mayúsculas)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    for (const line of lines) {
      // Buscar líneas que parezcan nombres de empresas/personas
      if (line.length > 5 && line.length < 60 && !line.match(/^\d+$/) && !line.match(/^[\d\s.,]+$/)) {
        if (!result.razonSocial) {
          result.razonSocial = line;
          result.cliente = line;
        }
      }
    }

    return result;
  }

  private parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  private async extractInvoiceWithGemini(fileBuffer: Buffer, mimeType: string): Promise<ExtractedInvoice> {
    // Generar un hash del contenido para caché
    const crypto = require('crypto');
    const contentHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const cacheKey = `invoice_extraction:${contentHash}`;

    // Intentar obtener de caché primero
    const cached = await this.getCachedExtraction(cacheKey);
    if (cached) {
      this.logger.log('Datos de factura obtenidos de caché');
      return cached;
    }

    let response;
    let retries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.config.get('gemini.apiKey')}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Analiza este documento de factura argentina y extrae SOLO en formato JSON válido estos campos:
                      - fecha (formato ISO: YYYY-MM-DD, ej: "2025-01-22")
                      - razon_social (nombre del cliente o comprador, NO del emisor)
                      - cuit (CUIT del cliente, formato: XX-XXXXXXXX-X)
                      - numero_ticket (número completo de comprobante, ej: "00002-00002747")
                      - importe_neto (número decimal, usar punto como separador decimal, sin separador de miles)
                      - iva_21 (número decimal, usar punto como separador decimal)
                      - total (número decimal, usar punto como separador decimal)

                      Importante: 
                      - razon_social debe ser el nombre del CLIENTE (comprador), NO del emisor de la factura
                      - Busca en campos como "Apellido y Nombre / Razón Social" o similares
                      - La fecha debe estar en formato YYYY-MM-DD. Si no puedes determinar la fecha, devuelve null.
                      Responde SOLO con el JSON, sin markdown ni explicaciones.`,
                  },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: fileBuffer.toString('base64'),
                    },
                  },
                ],
              },
            ],
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000,
          }
        );
        break; // Si llegamos aquí, la solicitud fue exitosa
      } catch (err: any) {
        lastError = err;
        const status = err.response?.status;
        const message = err.response?.data?.error?.message || err.message;

        // Si es error 429 (rate limit), esperar y reintentar
        if (status === 429 && attempt < retries) {
          const retryAfter = err.response?.data?.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay || 45;
          this.logger.warn(`Rate limit alcanzado (intento ${attempt}/${retries}). Esperando ${retryAfter}s antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        // Si no es 429 o ya no hay más reintentos, lanzar error
        this.logger.error(`Error en Gemini API [${status}]: ${message}`);
        throw new Error(`Error al comunicarse con el servicio de extracción: ${status || 'timeout'} - ${message}`);
      }
    }

    if (!response) {
      throw new Error('No se pudo obtener respuesta del servicio de extracción después de múltiples intentos');
    }

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      this.logger.error('Gemini response sin candidates', JSON.stringify(response.data));
      throw new Error('El servicio de extracción no devolvió resultados para esta factura');
    }

    const textResponse = candidates[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      this.logger.error('Gemini response sin text', JSON.stringify(response.data));
      throw new Error('El servicio de extracción devolvió una respuesta vacía');
    }

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.error('Gemini response sin JSON', textResponse);
      throw new Error('El servicio de extracción no devolvió un formato válido');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      this.logger.error('Error parseando JSON de Gemini', jsonMatch[0]);
      throw new Error('No se pudo interpretar la respuesta del servicio de extracción');
    }

    const fecha = this.parseDate(parsed.fecha);
    const razonSocial = this.cleanRazonSocial(parsed.razon_social);
    const result = {
      fecha: fecha,
      cliente: razonSocial,
      cuit: parsed.cuit || null,
      razonSocial: razonSocial,
      numeroTicket: parsed.numero_ticket || null,
      neto: parsed.importe_neto ? parseFloat(parsed.importe_neto) : null,
      ivaPorcentaje: parsed.iva_21 ? 21 : null,
      ivaMonto: parsed.iva_21 ? parseFloat(parsed.iva_21) : null,
      total: parsed.total ? parseFloat(parsed.total) : null,
      confidence: 0.85,
      rawText: JSON.stringify(parsed),
    };

    // Guardar en caché por 1 hora
    await this.setCachedExtraction(cacheKey, result, 3600);

    return result;
  }

  private async getCachedExtraction(key: string): Promise<any | null> {
    // Implementación simple de caché en memoria (se puede reemplazar por Redis)
    if (!(global as any).invoiceExtractionCache) {
      (global as any).invoiceExtractionCache = new Map();
    }

    const cache = (global as any).invoiceExtractionCache;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  }

  private async setCachedExtraction(key: string, value: any, ttlSeconds: number): Promise<void> {
    if (!(global as any).invoiceExtractionCache) {
      (global as any).invoiceExtractionCache = new Map();
    }

    const cache = (global as any).invoiceExtractionCache;
    cache.set(key, {
      data: value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });

    // Limpiar caché antiguo (mantener máximo 1000 entradas)
    if (cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of cache.entries()) {
        if (v.expiresAt < now) {
          cache.delete(k);
        }
      }
    }
  }

  private cleanRazonSocial(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const patterns = [
      /^Apellido\s+y\s+Nombre\s*\/\s*Raz[oó]n\s+Social\s*:\s*/i,
      /^Raz[oó]n\s+Social\s*:\s*/i,
      /^Apellido\s+y\s+Nombre\s*:\s*/i,
      /^Cliente\s*:\s*/i,
      /^Nombre\s*:\s*/i,
    ];
    let cleaned = trimmed;
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    cleaned = cleaned.trim();
    return cleaned || trimmed;
  }

  private parseDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return dateStr;
    }
    const dmyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
    }
    const ymdMatch = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (ymdMatch) {
      return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
    }
    return null;
  }

  parseMessage(message: string, userCategories: string[] = []): ParsedTransaction {
    const text = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const result: ParsedTransaction = {
      type: null,
      amount: null,
      category: null,
      description: null,
      date: new Date().toISOString().split('T')[0],
      confidence: 0,
      raw: message,
    };

    const expenseKeywords = ['gaste', 'pague', 'pago', 'cargue', 'compre', 'egreso', 'salida', 'gasto', 'costo'];
    const incomeKeywords = ['cobre', 'cobro', 'ingreso', 'ingrese', 'recibí', 'recibi', 'venta', 'facture'];

    let expenseScore = 0;
    let incomeScore = 0;

    for (const kw of expenseKeywords) {
      if (text.includes(kw)) expenseScore++;
    }
    for (const kw of incomeKeywords) {
      if (text.includes(kw)) incomeScore++;
    }

    result.type = incomeScore > expenseScore ? 'INCOME' : expenseScore > 0 ? 'EXPENSE' : null;
    result.amount = this.extractAmount(text);
    result.category = this.detectCategory(text, userCategories);
    result.description = text.substring(0, 100);
    result.confidence = result.type && result.amount ? 0.8 : 0.5;

    return result;
  }

  private extractAmount(text: string): number | null {
    const clean = text.replace(/\$|ars|pesos?/gi, ' ');
    const patterns = [
      /(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?)/g,
      /(\d+(?:[.,]\d+)?)/g,
    ];

    for (const pattern of patterns) {
      const matches = clean.match(pattern);
      if (matches) {
        for (const match of matches) {
          let normalized = match.replace(/\./g, '').replace(',', '.');
          const num = parseFloat(normalized);
          if (!isNaN(num) && num > 0 && num < 100000000) {
            return num;
          }
        }
      }
    }
    return null;
  }

  private detectCategory(text: string, userCategories: string[]): string | null {
    for (const cat of userCategories) {
      const catNorm = cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (text.includes(catNorm)) return cat;
    }
    return null;
  }

  async getFinancialAdvice(userMessage: string, context: {
    balance?: number;
    income?: number;
    expense?: number;
    transactionsCount?: number;
    workspaces?: any[];
    categories?: any[];
  } = {}): Promise<string> {
    if (!this.geminiModel) {
      return this.getFallbackAdvice(userMessage, context);
    }

    const prompt = `
Eres un asistente financiero amable y experto de GESTIONAR2. Tu propósito es ayudar al usuario con dudas, problemas o consultas sobre finanzas personales/empresariales.

El usuario escribió: "${userMessage}"

Contexto del usuario:
- Balance actual: ${context.balance ?? 'N/A'}
- Ingresos del periodo: ${context.income ?? 'N/A'}
- Gastos del periodo: ${context.expense ?? 'N/A'}
- Transacciones recientes: ${context.transactionsCount ?? 0}

Responde en español con un tono cercano y útil. Sé conciso pero completo. Ofrece sugerencias prácticas.

Si el usuario reporta un problema técnico, dale instrucciones claras para resolverlo.
Si pregunta sobre cómo usar algo, explica paso a paso.
Si busca consejos financieros, dale recomendaciones basadas en buenas prácticas.

Responde SOLO con el texto, sin markdown ni estructura JSON.`;

    try {
      const response = await this.geminiModel.generateContent(prompt);
      return response.response.candidates[0].content.parts[0].text;
    } catch (err) {
      this.logger.error('Error generando consejo IA:', err.message);
      return this.getFallbackAdvice(userMessage, context);
    }
  }

  private getFallbackAdvice(message: string, context: any): string {
    const text = message.toLowerCase();

    if (text.includes('no conecta') || text.includes('error') || text.includes('falla')) {
      return 'Si tenés problemas de conexión, probá:\n1. Revisar que el botón de Telegram esté conectado\n2. Reiniciar la app\n3. Usar /start para re-vincular tu cuenta';
    }

    if (text.includes('gasto') && text.includes('no registra')) {
      return 'Si no se registra un gasto:\n1. Asegurate de tener un espacio de trabajo activo (usá /modo)\n2. Escribi el gasto con texto libre: "Gasté 5000 en nafta"\n3. Si usás categorías, verificá que existan en tu espacio';
    }

    if (text.includes('factura') && text.includes('no sube')) {
      return 'Para subir facturas:\n1. Asegurate de estar en modo Empresarial (/modo)\n2. Enviá la foto del documento\n3. El bot tiene 60 segundos para procesarla\n4. Si falla, envia el PDF directamente';
    }

    if (text.includes('cuenta') || text.includes('vincula')) {
      return 'Para vincular tu cuenta:\n1. Abri GESTIONAR2 en web\n2. Fijate en Configuración -> Telegram\n3. Copiá tu ID de usuario\n4. En Telegram mandame: "ID: tu_id_aqui"';
    }

    if (text.includes('categoría') || text.includes('categoria')) {
      return 'Para crear categorías:\n1. Escribí un gasto o ingreso\n2. Cuando te pida categoría, seleccioná "➕ Nueva categoría"\n3. Escribí el nombre de la categoría\n4. La categoría se creará automáticamente';
    }

    if (text.includes('dividir') || text.includes('división')) {
      return 'Para dividir gastos:\n1. Usá el comando /dividir\n2. Escribí en formato: "Persona1: monto, Persona2: monto"\n3. Ejemplo: "Santiago: 15000, María: 8000, Juan: 22000"\n4. El bot calculará quién le debe a quién';
    }

    if (text.includes('balance') || text.includes('resumen')) {
      return 'Para ver tu balance:\n1. Usá el botón "📊 Balance" del menú\n2. Verás ingresos, gastos y balance del mes\n3. También podés ver últimos gastos e ingresos\n4. Usá /modo para cambiar de espacio de trabajo';
    }

    if (text.includes('voz') || text.includes('audio') || text.includes('transcribir')) {
      return 'Para usar asistencia por voz:\n1. Enviá un audio con tu gasto/ingreso\n2. Ejemplo: "Gasté 15000 en nafta"\n3. El bot transcribirá y procesará automáticamente\n4. Te pedirá confirmación antes de registrar';
    }

    if (text.includes('ayuda') || text.includes('help') || text.includes('comandos')) {
      return 'Comandos disponibles:\n/start - Vincular cuenta\n/ayuda - Ver ayuda\n/modo - Cambiar espacio de trabajo\n/dividir - Dividir gastos\n\nEscribí tu consulta y te respondo!';
    }

    if (text.includes('modo') || text.includes('workspace') || text.includes('espacio')) {
      return 'Para cambiar de modo:\n1. Usá el comando /modo\n2. Seleccioná entre Personal o Empresarial\n3. Elegí el espacio de trabajo\n4. Podés tener múltiples espacios de trabajo';
    }

    if (text.includes('ingreso') || text.includes('cobré') || text.includes('cobro')) {
      return 'Para registrar ingresos:\n1. Escribí: "Cobré 50000 de cliente"\n2. El bot detectará que es un ingreso\n3. Seleccioná la categoría\n4. Confirmá el registro';
    }

    if (text.includes('ahorrar') || text.includes('ahorro') || text.includes('consejos')) {
      return 'Consejos para ahorrar:\n1. Registrá todos tus gastos diariamente\n2. Usá categorías para identificar gastos hormiga\n3. Establecé límites por categoría\n4. Revisá tu balance semanalmente\n5. Separá ahorros automáticamente';
    }

    return '¡Hola! Soy tu asistente de GESTIONAR2. Puedo ayudarte con:\n\n📊 Consultas financieras y balances\n📝 Registro de gastos e ingresos\n📄 Facturas y comprobantes\n🧮 División de gastos\n🔧 Problemas técnicos\n💡 Consejos de ahorro\n🎤 Asistencia por voz\n\nEscribí tu duda y te ayudo a resolverla!';
  }
}
