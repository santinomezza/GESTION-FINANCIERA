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
    if (!this.geminiModel) {
      throw new Error('Gemini API no está configurada');
    }

    let response;
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
                    - razon_social (nombre del emisor)
                    - cuit (formato: XX-XXXXXXXX-X)
                    - numero_ticket (número completo de comprobante, ej: "00002-00002747")
                    - importe_neto (número decimal, usar punto como separador decimal, sin separador de miles)
                    - iva_21 (número decimal, usar punto como separador decimal)
                    - total (número decimal, usar punto como separador decimal)

                    Importante: La fecha debe estar en formato YYYY-MM-DD. Si no puedes determinar la fecha, devuelve null.
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
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.error?.message || err.message;
      this.logger.error(`Error en Gemini API [${status}]: ${message}`);
      throw new Error(`Error al comunicarse con el servicio de extracción: ${status || 'timeout'} - ${message}`);
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
    return {
      fecha: fecha,
      cliente: parsed.razon_social || null,
      cuit: parsed.cuit || null,
      razonSocial: parsed.razon_social || null,
      numeroTicket: parsed.numero_ticket || null,
      neto: parsed.importe_neto ? parseFloat(parsed.importe_neto) : null,
      ivaPorcentaje: parsed.iva_21 ? 21 : null,
      ivaMonto: parsed.iva_21 ? parseFloat(parsed.iva_21) : null,
      total: parsed.total ? parseFloat(parsed.total) : null,
      confidence: 0.85,
      rawText: JSON.stringify(parsed),
    };
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
    
    return '¡Hola! Soy tu asistente de GESTIONAR2. Puedo ayudarte con:\n\n📊 Consultas financieras\n📝 Registro de gastos/ingresos\n📄 Facturas y comprobantes\n🧮 Division de gastos\n🔧 Problemas técnicos\n\nEscribi tu duda y te ayudo a resolverla!';
  }
}
