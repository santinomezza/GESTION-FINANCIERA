import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from '../transactions/transactions.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { InvoicesService } from '../invoices.service';
import { ClientsService } from '../clients/clients.service';
import { WorkspacesService } from '../common/guards/workspaces.service';
import { RedisCacheService } from '../common/services/redis-cache.service';
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SessionData {
  state: 'idle' | 'awaiting_category' | 'awaiting_new_category_confirm' | 'awaiting_mode_selection' | 'awaiting_invoice_confirm' | 'awaiting_split_input';
  pendingTransaction: any;
  pendingInvoice: any;
  pendingInvoiceFileUrl: string | null;
  pendingInvoiceBufferBase64: string | null;
  userId: string | null;
  workspaceId: string | null;
}

type MyContext = Context & SessionFlavor<SessionData>;

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot<MyContext> | null = null;
  private isRunning = false;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private aiService: AiService,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
    private dashboardService: DashboardService,
    private invoicesService: InvoicesService,
    private clientsService: ClientsService,
    private workspacesService: WorkspacesService,
    private cache: RedisCacheService,
  ) { }

  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  private async fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async getCachedUser(telegramId: string) {
    const cacheKey = `telegram:user:${telegramId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;
    const user = await this.prisma.user.findFirst({
      where: { telegramId, deletedAt: null, isActive: true },
    });
    if (user) {
      await this.cache.set(cacheKey, user, 3600);
    }
    return user;
  }

  private async getCachedWorkspaces(userId: string) {
    const cacheKey = `telegram:workspaces:${userId}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;
    const workspaces = await this.prisma.workspace.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    await this.cache.set(cacheKey, workspaces, 300);
    return workspaces;
  }

  private async getCachedCategories(workspaceId: string) {
    const cacheKey = `telegram:categories:${workspaceId}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;
    const categories = await this.prisma.category.findMany({
      where: { workspaceId, deletedAt: null, isActive: true },
    });
    await this.cache.set(cacheKey, categories, 300);
    return categories;
  }

  async invalidateUserCache(telegramId: string, userId: string) {
    await this.cache.del(`telegram:user:${telegramId}`);
    await this.cache.del(`telegram:workspaces:${userId}`);
  }

  async invalidateWorkspaceCache(workspaceId: string) {
    await this.cache.invalidatePattern(`telegram:categories:${workspaceId}`);
  }

  async onModuleInit() {
    const token = this.config.get('telegram.botToken');
    if (!token) {
      this.logger.warn('Sin TELEGRAM_BOT_TOKEN — el bot de Telegram no está activo');
      return;
    }

    if (this.isRunning) {
      this.logger.warn('Bot de Telegram ya está corriendo, se omite doble inicio');
      return;
    }

    try {
      this.bot = new Bot<MyContext>(token);

      this.bot.use(session({
        initial: (): SessionData => ({
          state: 'idle',
          pendingTransaction: null,
          pendingInvoice: null,
          pendingInvoiceFileUrl: null,
          pendingInvoiceBufferBase64: null,
          userId: null,
          workspaceId: null,
        }),
      }));

      this.setupHandlers();

      const webhookUrl = this.config.get('telegram.webhookUrl');
      if (webhookUrl) {
        await this.bot.api.deleteWebhook({ drop_pending_updates: false });
        await this.bot.api.setWebhook(`${webhookUrl}/api/telegram/webhook`);
        this.logger.log(`Webhook configurado: ${webhookUrl}/api/telegram/webhook`);
      } else {
        await this.bot.api.deleteWebhook({ drop_pending_updates: false });
        this.bot.start();
        this.isRunning = true;
        this.logger.log('Bot iniciado en modo polling (desarrollo)');
      }
    } catch (err: any) {
      if (err.error_code === 409) {
        this.logger.error('Error 409: otra instancia del bot ya está corriendo. Solo debe haber una instancia activa.');
      } else {
        this.logger.error('Error al inicializar el bot de Telegram:', err.message || err);
      }
    }
  }

  async onModuleDestroy() {
    if (this.bot && this.isRunning) {
      try {
        await this.bot.stop();
        this.isRunning = false;
        this.logger.log('Bot de Telegram detenido');
      } catch (err) {
        this.logger.error('Error al detener el bot:', err);
      }
    }
  }

  private setupHandlers() {
    this.bot.command('start', async (ctx) => {
      await this.handleStart(ctx);
    });

    this.bot.command('ayuda', async (ctx) => {
      await this.handleAyuda(ctx);
    });

    this.bot.command('modo', async (ctx) => {
      await this.handleModeSelection(ctx);
    });

    this.bot.command('dividir', async (ctx) => {
      await this.handleSplitInput(ctx);
    });

    this.bot.callbackQuery('btn_balance', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleBalance(ctx);
    });

    this.bot.callbackQuery('btn_expenses', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleGastos(ctx);
    });

    this.bot.callbackQuery('btn_income', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleIngresos(ctx);
    });

    this.bot.callbackQuery('btn_mode', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleModeSelection(ctx);
    });

    this.bot.callbackQuery('btn_invoices', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleInvoiceHelp(ctx);
    });

    this.bot.callbackQuery('btn_split', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleSplitInput(ctx);
    });

    this.bot.callbackQuery('btn_help', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleAyuda(ctx);
    });

    this.bot.callbackQuery('btn_ai_help', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '💬 *Asistencia Inteligente GESTIONAR2*\n\n' +
        'Soy tu asistente financiero personal. Puedo ayudarte con:\n\n' +
        '*📝 Registro de movimientos:*\n' +
        '• "Gasté 15000 en nafta"\n' +
        '• "Cobré 50000 de cliente"\n' +
        '• "Pagué 8000 de luz"\n\n' +
        '*📄 Facturas y comprobantes:*\n' +
        '• "¿Cómo subo una factura?"\n' +
        '• "No puedo escanear facturas"\n' +
        '• "Extraer datos de factura"\n\n' +
        '*📊 Consultas financieras:*\n' +
        '• "¿Cuál es mi balance?"\n' +
        '• "Consejos para ahorrar"\n' +
        '• "Cómo reducir gastos"\n\n' +
        '*🔧 Problemas técnicos:*\n' +
        '• "No me registra los gastos"\n' +
        '• "El bot no responde"\n' +
        '• "Error al conectar Telegram"\n\n' +
        '*🧮 División de gastos:*\n' +
        '• "Dividir gastos entre amigos"\n' +
        '• "Cómo usar /dividir"\n\n' +
        '*💡 Categorías y organización:*\n' +
        '• "Crear categorías"\n' +
        '• "Organizar mis gastos"\n\n' +
        'Escribí tu consulta y te respondo de inmediato!',
        { parse_mode: 'Markdown' }
      );
    });

    this.bot.callbackQuery('main_menu', async (ctx) => {
      await this.handleMainMenu(ctx);
    });

    this.bot.callbackQuery('main_balance', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleBalance(ctx);
    });

    this.bot.callbackQuery('main_expenses', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleGastos(ctx);
    });

    this.bot.callbackQuery('main_income', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleIngresos(ctx);
    });

    this.bot.callbackQuery('main_split', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleSplitInput(ctx);
    });

    this.bot.callbackQuery('main_invoices', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleInvoiceHelp(ctx);
    });

    this.bot.callbackQuery('main_help', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleAyuda(ctx);
    });

    this.bot.callbackQuery('main_mode', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.handleModeSelection(ctx);
    });

    this.bot.callbackQuery(/^confirm_(.+)/, async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.session.pendingTransaction || !ctx.session.workspaceId) {
        await ctx.editMessageText('⏰ Sesión expirada. Enviá el mensaje de nuevo.');
        return;
      }
      const tx = ctx.session.pendingTransaction;
      const workspaceId = ctx.session.workspaceId;
      try {
        const created = await this.transactionsService.create(workspaceId, {
          type: tx.type,
          amount: tx.amount,
          categoryId: tx.categoryId || undefined,
          categoryName: tx.categoryName || undefined,
          description: tx.description,
          date: tx.date,
          paymentMethod: 'CASH',
        });
        ctx.session.pendingTransaction = null;
        ctx.session.state = 'idle';
        const typeEmoji = tx.type === 'INCOME' ? '💰' : '💸';
        const amount = Number(tx.amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
        const typeLabel = tx.type === 'INCOME' ? 'Ingreso' : 'Gasto';
        const keyboard = [
          [{ text: '➕ Nuevo movimiento', callback_data: 'new_tx' }],
          [{ text: '🔄 Cambiar espacio', callback_data: 'main_mode' }],
          [{ text: '📊 Ver resumen', callback_data: 'main_balance' }],
        ];
        await ctx.editMessageText(
          `✅ *${typeLabel} registrado exitosamente!*\n\n` +
          `${typeEmoji} ${amount}\n` +
          `🏷️ ${this.escapeMarkdown(tx.categoryName || 'Sin categoría')}\n` +
          `📅 ${tx.date}\n\n` +
          `¿Qué querés hacer ahora?`,
          {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard },
          }
        );
      } catch (err) {
        this.logger.error('Error al guardar transacción:', err);
        await ctx.editMessageText('❌ Error al guardar el movimiento. Intentá de nuevo.');
      }
    });

    this.bot.callbackQuery('cancel', async (ctx) => {
      ctx.session.state = 'idle';
      ctx.session.pendingTransaction = null;
      await ctx.answerCallbackQuery();
      await ctx.editMessageText('❌ Operación cancelada.');
    });

    this.bot.callbackQuery(/^cat_(.+)/, async (ctx) => {
      const categoryId = ctx.callbackQuery.data.replace('cat_', '');
      await ctx.answerCallbackQuery();
      if (!ctx.session.pendingTransaction || !ctx.session.userId) {
        await ctx.editMessageText('⏰ Sesión expirada. Enviá el mensaje de nuevo.');
        return;
      }
      const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
      ctx.session.pendingTransaction.categoryId = categoryId;
      ctx.session.pendingTransaction.categoryName = category?.name;
      ctx.session.state = 'idle';
      await ctx.editMessageText(`✅ Categoría: *${this.escapeMarkdown(category?.name || '')}*`, { parse_mode: 'Markdown' });
      await this.showConfirmation(ctx, ctx.session.pendingTransaction, category);
    });

    this.bot.callbackQuery('new_category', async (ctx) => {
      ctx.session.state = 'awaiting_new_category_confirm';
      await ctx.answerCallbackQuery();
      await ctx.editMessageText('📝 Escribí el nombre de la nueva categoría:');
    });

    this.bot.callbackQuery(/^mode_(.+)/, async (ctx) => {
      const data = ctx.callbackQuery.data;
      await ctx.answerCallbackQuery();
      if (data === 'mode_section_personal' || data === 'mode_section_business') {
        return;
      }
      const workspaceId = data.replace('mode_', '');
      const workspace = await this.prisma.workspace.findFirst({ where: { id: workspaceId } });
      if (!workspace) {
        await ctx.editMessageText('⚠️ Espacio de trabajo no encontrado.');
        return;
      }
      ctx.session.workspaceId = workspace.id;
      ctx.session.state = 'idle';
      const modeLabel = workspace.type === 'BUSINESS' ? '🏢 Empresarial' : '👤 Personal';
      await ctx.editMessageText(
        `✅ Modo cambiado exitosamente\n\n` +
        `Espacio activo: *${this.escapeMarkdown(workspace.name)}*\n` +
        `Modo: ${modeLabel}\n\n` +
        `Ya podés registrar movimientos en este espacio.`,
        { parse_mode: 'Markdown' }
      );
    });

    this.bot.callbackQuery(/^invoice_confirm_(.+)/, async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.session.pendingInvoice || !ctx.session.workspaceId) {
        await ctx.editMessageText('⏰ Sesión expirada. Enviá la factura de nuevo.');
        return;
      }
      const extracted = ctx.session.pendingInvoice;
      const workspaceId = ctx.session.workspaceId;
      try {
        let clientId: string | undefined;
        if (extracted.cliente || extracted.razonSocial || extracted.cuit) {
          const clientName = extracted.razonSocial || extracted.cliente;
          if (clientName) {
            const existingClients = await this.clientsService.findAll(workspaceId);
            const existingClient = existingClients.find(c => c.cuit === extracted.cuit || c.name.toLowerCase() === clientName.toLowerCase());
            if (existingClient) {
              clientId = existingClient.id;
            } else {
              const newClient = await this.clientsService.create(workspaceId, { name: clientName, cuit: extracted.cuit || undefined });
              clientId = newClient.id;
            }
          }
        }
        const issueDate = extracted.fecha ? new Date(extracted.fecha) : new Date();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30);
        const invoiceNumber = extracted.numeroTicket || `TG-${Date.now()}`;
        const invoice = await this.invoicesService.create(workspaceId, {
          invoiceNumber,
          issueDate,
          dueDate,
          totalAmount: extracted.total,
          netAmount: extracted.neto || undefined,
          ivaPercentage: extracted.ivaPorcentaje || undefined,
          ivaAmount: extracted.ivaMonto || undefined,
          status: 'PENDING',
          clientId: clientId || '',
          urlArchivo: ctx.session.pendingInvoiceFileUrl || null,
          file: ctx.session.pendingInvoiceBufferBase64 ? Buffer.from(ctx.session.pendingInvoiceBufferBase64, 'base64') : undefined,
          fileMimeType: ctx.session.pendingInvoiceFileUrl ? (ctx.session.pendingInvoiceFileUrl.includes('.pdf') ? 'application/pdf' : 'image/jpeg') : undefined,
        } as any);
        ctx.session.pendingInvoice = null;
        ctx.session.pendingInvoiceFileUrl = null;
        ctx.session.pendingInvoiceBufferBase64 = null;
        ctx.session.state = 'idle';
        await ctx.editMessageText(
          `✅ *Factura registrada exitosamente*\n\n` +
          `🎫 ${this.escapeMarkdown(invoice.invoiceNumber)}\n` +
          `💵 Total: ${extracted.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}\n` +
          `📅 Vencimiento: ${format(dueDate, 'dd/MM/yyyy', { locale: es })}`,
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        this.logger.error('Error guardando factura:', err);
        await ctx.editMessageText('❌ Error al guardar la factura. Intentá de nuevo.');
      }
    });

    this.bot.callbackQuery('invoice_cancel', async (ctx) => {
      ctx.session.state = 'idle';
      ctx.session.pendingInvoice = null;
      ctx.session.pendingInvoiceFileUrl = null;
      ctx.session.pendingInvoiceBufferBase64 = null;
      await ctx.answerCallbackQuery();
      await ctx.editMessageText('❌ Factura cancelada.');
    });

    this.bot.callbackQuery('new_tx', async (ctx) => {
      await ctx.answerCallbackQuery();
      const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
      if (!user || !workspace) return;
      ctx.session.pendingTransaction = null;
      ctx.session.pendingInvoice = null;
      ctx.session.pendingInvoiceFileUrl = null;
      ctx.session.pendingInvoiceBufferBase64 = null;
      ctx.session.state = 'idle';
      await ctx.reply(
        `📝 *Nuevo movimiento*\n\n` +
        `Escribí tu movimiento directamente, por ejemplo:\n` +
        `• "Gasté 15000 en nafta"\n` +
        `• "Cobré 50000 de cliente"\n` +
        `• "Pagué 8000 de luz"`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '🏠 Volver al menú principal', callback_data: 'main_menu' },
            ]],
          },
        }
      );
    });

    this.bot.on('message:text', async (ctx) => {
      const text = ctx.message.text;
      if (text.startsWith('/')) return;

      const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
      if (!user || !workspace) return;
      if (ctx.session.state === 'awaiting_new_category_confirm') {
        await this.handleNewCategoryName(ctx, text);
        return;
      }
      if (ctx.session.state === 'awaiting_split_input') {
        await this.handleSplitCalculation(ctx, text);
        return;
      }
      if (ctx.session.state === 'awaiting_mode_selection') {
        await ctx.reply('⚠️ Seleccioná un espacio de trabajo usando los botones o usá /modo para volver a ver las opciones.');
        return;
      }
      if (ctx.session.state === 'awaiting_category') {
        return;
      }

      ctx.session.userId = user.id;
      ctx.session.workspaceId = workspace.id;

      const categories = await this.getCachedCategories(workspace.id);
      const categoryNames = categories.map(c => c.name);
      const parsed = await this.aiService.parseMessage(text, categoryNames);

      if (!parsed.type || !parsed.amount) {
        await ctx.reply(
          `🤔 No pude interpretar ese movimiento.\n\n` +
          `Probá con mensajes como:\n` +
          `• "Gasté 15000 en nafta"\n` +
          `• "Cobré 50000 de cliente"\n` +
          `• "Pagué 8000 de luz"\n\n` +
          `Escribí /ayuda para más ejemplos.`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🏠 Volver al menú principal', callback_data: 'main_menu' },
              ]],
            }
          }
        );
        return;
      }

      let category = null;
      if (parsed.category) {
        category = categories.find(c => c.name.toLowerCase() === parsed.category.toLowerCase());
      }

      ctx.session.pendingTransaction = {
        type: parsed.type,
        amount: parsed.amount,
        categoryId: category?.id || null,
        categoryName: category?.name || parsed.category || null,
        description: parsed.description,
        date: parsed.date,
      };

      if (!category) {
        await this.askForCategory(ctx, categories, parsed);
        return;
      }

      await this.showConfirmation(ctx, ctx.session.pendingTransaction, category);
    });

    this.bot.on('message:voice', async (ctx) => {
      await this.handleVoiceMessage(ctx);
    });

    this.bot.on('message:photo', async (ctx) => {
      await this.handlePhotoMessage(ctx);
    });

    this.bot.on('message:document', async (ctx) => {
      await this.handleDocumentMessage(ctx);
    });
  }

  private async handleStart(ctx: MyContext) {
    const telegramId = String(ctx.from.id);
    const user = await this.getCachedUser(telegramId);

    if (user) {
      const workspaces = await this.getCachedWorkspaces(user.id);

      if (workspaces.length === 0) {
        await ctx.reply(
          `⚠️ ¡Hola, ${user.name}!\n\n` +
          `Tu cuenta está vinculada, pero no tenés espacios de trabajo. Creá uno desde la aplicación web.`
        );
        return;
      }

      if (workspaces.length === 1) {
        ctx.session.userId = user.id;
        ctx.session.workspaceId = workspaces[0].id;
        const modeLabel = workspaces[0].type === 'BUSINESS' ? '🏢 Empresarial' : '👤 Personal';
        await ctx.reply(
          `✅ ¡Bienvenido de vuelta, ${this.escapeMarkdown(user.name)}!\n\n` +
          `Espacio activo: *${this.escapeMarkdown(workspaces[0].name)}* (${modeLabel})\n\n` +
          `Podés registrar movimientos escribiéndolos directamente.\n` +
          `Usá los botones del menú para navegar.`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '🏠 Ir al menú principal', callback_data: 'main_menu' }
              ]]
            }
          }
        );
        return;
      }

      ctx.session.userId = user.id;
      await this.showModeSelection(ctx, user.id, user.name);
      return;
    }

    await ctx.reply(
      `👋 ¡Hola! Soy el asistente de *GESTIONAR2*.\n\n` +
      `Para comenzar, necesitás vincular tu cuenta:\n\n` +
      `1. Volvé a la página de Configuración de GESTIONAR2.\n` +
      `2. Copiá el siguiente ID y pegalo en el campo de texto:\n\n` +
      `\`${telegramId}\`\n\n` +
      `¡Después vas a poder registrar gastos, ingresos y facturas desde acá!`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🏠 Ir al menú principal', callback_data: 'main_menu' }
          ]]
        }
      }
    );
  }

  private async showModeSelection(ctx: MyContext, userId: string, userName?: string) {
    const workspaces = await this.getCachedWorkspaces(userId);

    if (workspaces.length === 0) {
      await ctx.reply('⚠️ No tenés espacios de trabajo. Creá uno desde la aplicación web.');
      return;
    }

    const personalWs = workspaces.filter(w => w.type === 'PERSONAL');
    const businessWs = workspaces.filter(w => w.type === 'BUSINESS');

    const keyboard: any[] = [];

    if (personalWs.length > 0) {
      keyboard.push([{ text: '👤 Modo Personal', callback_data: 'mode_section_personal' }]);
      for (const ws of personalWs) {
        keyboard.push([{ text: `  📂 ${ws.name}`, callback_data: `mode_${ws.id}` }]);
      }
    }

    if (businessWs.length > 0) {
      keyboard.push([{ text: '🏢 Modo Empresarial', callback_data: 'mode_section_business' }]);
      for (const ws of businessWs) {
        keyboard.push([{ text: `  🏪 ${ws.name}`, callback_data: `mode_${ws.id}` }]);
      }
    }

    ctx.session.state = 'awaiting_mode_selection';

    const greeting = userName ? `¡Hola, ${this.escapeMarkdown(userName)}!` : '¡Hola!';
    await ctx.reply(
      `🔄 *Seleccioná dónde querés operar*\n\n` +
      `${greeting} Elegí el espacio de trabajo para esta sesión:`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      }
    );
  }

  private async handleModeSelection(ctx: MyContext) {
    const userId = ctx.session.userId;
    if (!userId) {
      await ctx.reply('⚠️ Primero necesitás vincular tu cuenta con /start');
      return;
    }
    await this.showModeSelection(ctx, userId);
  }

  private async getTelegramUserAndWorkspace(ctx: MyContext) {
    const telegramId = String(ctx.from.id);
    const user = await this.getCachedUser(telegramId);

    if (!user) {
      await ctx.reply(
        `⚠️ Tu cuenta de Telegram no está vinculada aún.\n` +
        `Usá /start para ver cómo vincularla.`
      );
      return { user: null, workspace: null };
    }

    if (!ctx.session.workspaceId) {
      const workspaces = await this.getCachedWorkspaces(user.id);

      if (workspaces.length === 0) {
        await ctx.reply('⚠️ No tenés espacios de trabajo. Creá uno desde la aplicación web.');
        return { user: null, workspace: null };
      }

      if (workspaces.length === 1) {
        ctx.session.workspaceId = workspaces[0].id;
        ctx.session.userId = user.id;
        return { user, workspace: workspaces[0] };
      }

      await this.showModeSelection(ctx, user.id, user.name);
      return { user: null, workspace: null };
    }

    const workspace = await this.prisma.workspace.findFirst({
      where: { id: ctx.session.workspaceId, userId: user.id },
    });

    if (!workspace) {
      await ctx.reply('⚠️ Espacio de trabajo no válido. Usá /modo para seleccionar uno.');
      return { user: null, workspace: null };
    }

    ctx.session.userId = user.id;
    return { user, workspace };
  }

  private async handleBalance(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);

    const [income, expense, count] = await this.prisma.$transaction([
      this.prisma.transaction.aggregate({
        where: { workspaceId: workspace.id, type: 'INCOME', date: { gte: from, lte: to }, deletedAt: null, status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { workspaceId: workspace.id, type: 'EXPENSE', date: { gte: from, lte: to }, deletedAt: null, status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: { workspaceId: workspace.id, date: { gte: from, lte: to }, deletedAt: null, status: 'CONFIRMED' },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);
    const balance = totalIncome - totalExpense;
    const totalTransactions = count;

    const monthName = format(now, 'MMMM yyyy', { locale: es });
    const fmt = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

    const modeLabel = workspace.type === 'BUSINESS' ? '🏢 Empresarial' : '👤 Personal';

    await ctx.reply(
      `📊 *Resumen de ${monthName}*\n` +
      `📂 ${this.escapeMarkdown(workspace.name)} (${modeLabel})\n\n` +
      `💰 Ingresos: *${fmt(totalIncome)}*\n` +
      `💸 Gastos: *${fmt(totalExpense)}*\n` +
      `────────────────\n` +
      `${balance >= 0 ? '✅' : '🔴'} Balance: *${fmt(balance)}*\n\n` +
      `📝 Total movimientos: ${totalTransactions}`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleGastos(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    const now = new Date();
    const from = startOfMonth(now);

    const txs = await this.prisma.transaction.findMany({
      where: {
        workspaceId: workspace.id,
        type: 'EXPENSE',
        deletedAt: null,
        date: { gte: from, lte: endOfMonth(now) },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    if (!txs.length) {
      await ctx.reply('📭 No hay gastos este mes todavía.');
      return;
    }

    const total = txs.reduce((s, t) => s + Number(t.amount), 0);
    let msg = `💸 *Últimos gastos del mes*\n\n`;

    for (const tx of txs) {
      const amt = Number(tx.amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      const cat = tx.category?.name || 'Sin categoría';
      const date = format(new Date(tx.date), 'dd/MM', { locale: es });
      msg += `• ${date} - ${this.escapeMarkdown(cat)}: *${amt}*\n`;
    }

    msg += `\n💵 Total mostrado: *${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
  }

  private async handleIngresos(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    const now = new Date();
    const txs = await this.prisma.transaction.findMany({
      where: {
        workspaceId: workspace.id,
        type: 'INCOME',
        deletedAt: null,
        date: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    if (!txs.length) {
      await ctx.reply('📭 No hay ingresos este mes todavía.');
      return;
    }

    const total = txs.reduce((s, t) => s + Number(t.amount), 0);
    let msg = `💰 *Últimos ingresos del mes*\n\n`;

    for (const tx of txs) {
      const amt = Number(tx.amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      const cat = tx.category?.name || 'Sin categoría';
      const date = format(new Date(tx.date), 'dd/MM', { locale: es });
      msg += `• ${date} - ${this.escapeMarkdown(cat)}: *${amt}*\n`;
    }
    msg += `\n💵 Total: *${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
  }

  private async handleMainMenu(ctx: MyContext) {
    await ctx.answerCallbackQuery();
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    const keyboard = [
      [{ text: '📊 Balance', callback_data: 'main_balance' }, { text: '💸 Gastos', callback_data: 'main_expenses' }],
      [{ text: '💰 Ingresos', callback_data: 'main_income' }, { text: '🧮 Dividir', callback_data: 'main_split' }],
      [{ text: '🔄 Modo', callback_data: 'main_mode' }, { text: '📄 Facturas', callback_data: 'main_invoices' }],
      [{ text: '❓ Ayuda', callback_data: 'main_help' }, { text: '💬 IA', callback_data: 'btn_ai_help' }],
    ];

    const modeLabel = workspace.type === 'BUSINESS' ? '🏢 Empresarial' : '👤 Personal';

    await ctx.editMessageText(
      `🎛️ *Menú Principal*\n\n` +
      `Espacio: *${this.escapeMarkdown(workspace.name)}*\n` +
      `Modo: ${modeLabel}\n\n` +
      `Seleccioná una opción:`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      }
    );
  }

  private async getWorkspaceBalance(workspaceId: string): Promise<number> {
    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);

    const [income, expense] = await this.prisma.$transaction([
      this.prisma.transaction.aggregate({
        where: { workspaceId, type: 'INCOME', date: { gte: from, lte: to }, deletedAt: null, status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { workspaceId, type: 'EXPENSE', date: { gte: from, lte: to }, deletedAt: null, status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
    ]);

    return Number(income._sum.amount || 0) - Number(expense._sum.amount || 0);
  }

  private async handleAyuda(ctx: MyContext) {
    const keyboard = [
      [{ text: '📊 Balance mensual', callback_data: 'main_balance' }],
      [{ text: '💸 Últimos gastos', callback_data: 'main_expenses' }],
      [{ text: '💰 Últimos ingresos', callback_data: 'main_income' }],
      [{ text: '🔄 Cambiar espacio', callback_data: 'main_mode' }],
      [{ text: '📄 Procesar factura', callback_data: 'main_invoices' }],
      [{ text: '🧮 Dividir gastos', callback_data: 'main_split' }],
      [{ text: '💬 Asistencia IA', callback_data: 'btn_ai_help' }],
    ];

    await ctx.reply(
      `🤖 *GESTIONAR2 — Ayuda*\n\n` +
      `Usá los botones para navegar por las funciones.\n\n` +
      `*📝 Registro rápido:*\n` +
      `Escribí directamente: "Gasté 15000 en nafta"\n` +
      `El bot interpreta y te pide confirmación.\n\n` +
      `*🎤 Asistencia por voz:*\n` +
      `Enviá audios para transcribir y procesar.\n\n` +
      `*📄 Facturas (modo Empresarial):*\n` +
      `Fotos o PDFs con datos extraídos automáticamente.\n\n` +
      `*🧮 División de gastos:*\n` +
      `Usá /dividir con: "Persona: monto, Otra: monto"`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      }
    );
  }

  async handleInvoiceHelp(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    if (workspace.type !== 'BUSINESS') {
      await ctx.reply(
        '📄 Para subir facturas necesitás estar en modo *Empresarial*.\n' +
        'Usá /modo para cambiar de espacio de trabajo.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    await ctx.reply(
      `📄 *Subir Factura*\n\n` +
      `Podés enviar tu factura de dos formas:\n\n` +
      `1. 📸 *Foto*: Sacá una foto clara de la factura y enviala directamente\n` +
      `2. 📎 *Archivo*: Enviá el PDF o imagen como archivo\n\n` +
      `El bot extraerá automáticamente:\n` +
      `• Fecha, razón social, CUIT\n` +
      `• Número de comprobante\n` +
      `• Montos (neto, IVA, total)\n\n` +
      `Luego te pedirá confirmación antes de registrarla.`,
      { parse_mode: 'Markdown' }
    );
  }

  async handleSplitInput(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    ctx.session.state = 'awaiting_split_input';

    await ctx.reply(
      `🧮 *Dividir Gastos*\n\n` +
      `Escribí los gastos en este formato:\n\n` +
      `\`Persona1: monto, Persona2: monto, ...\`\n\n` +
      `*Ejemplo:*\n` +
      `\`Santiago: 15000, María: 8000, Juan: 22000\`\n\n` +
      `El bot calculará quién le debe a quién para que todos gasten lo mismo.`,
      { parse_mode: 'Markdown' }
    );
  }

  async handleVoiceMessage(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    try {
      const voice = ctx.message.voice;
      const file = await ctx.api.getFile(voice.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${this.config.get('telegram.botToken')}/${file.file_path}`;

      await ctx.reply('🎤 Transcribiendo audio...');

      const response = await this.fetchWithTimeout(fileUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const audioBase64 = buffer.toString('base64');

      const transcript = await this.transcribeAudio(audioBase64);

      const categories = await this.getCachedCategories(workspace.id);
      const categoryNames = categories.map(c => c.name);

      const parsed = await this.aiService.parseMessage(transcript, categoryNames);

      if (!parsed.type || !parsed.amount) {
        await ctx.reply(
          `📝 *Transcripción:*\n\n${transcript}\n\n` +
          `🤔 No pude interpretar como movimiento. ` +
          `Probá escribiendo el gasto/ingreso directamente.`,
          { parse_mode: 'Markdown' }
        );
        ctx.session.state = 'idle';
        return;
      }

      let category = null;
      if (parsed.category) {
        category = categories.find(c => c.name.toLowerCase() === parsed.category.toLowerCase());
      }

      ctx.session.pendingTransaction = {
        type: parsed.type,
        amount: parsed.amount,
        categoryId: category?.id || null,
        categoryName: category?.name || parsed.category || null,
        description: parsed.description,
        date: parsed.date,
      };

      if (!category) {
        await this.askForCategory(ctx, categories, parsed);
        return;
      }

      await this.showConfirmation(ctx, ctx.session.pendingTransaction, category);
    } catch (err) {
      this.logger.error('Error procesando audio:', err);
      await ctx.reply('❌ No pude transcribir el audio. Intentá de nuevo.');
    }
  }

  async handlePhotoMessage(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    if (workspace.type !== 'BUSINESS') {
      await ctx.reply(
        '📸 Para procesar facturas necesitás estar en modo *Empresarial*.\n' +
        'Usá /modo para cambiar de espacio de trabajo.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    try {
      const photos = ctx.message.photo;
      const largestPhoto = photos[photos.length - 1];
      const file = await ctx.api.getFile(largestPhoto.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${this.config.get('telegram.botToken')}/${file.file_path}`;

      const response = await this.fetchWithTimeout(fileUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = 'image/jpeg';

      await ctx.reply('📄 Procesando factura...');

      const extracted = await this.invoicesService.extractInvoiceData(buffer, mimeType);

      if (!extracted.total || extracted.total <= 0) {
        await ctx.reply(
          '❌ No pude detectar el total de la factura en la imagen.\n\n' +
          'Asegurate de que la foto sea clara y se vean los montos.'
        );
        return;
      }

      ctx.session.pendingInvoice = extracted;
      ctx.session.pendingInvoiceFileUrl = null;
      ctx.session.state = 'awaiting_invoice_confirm';

      const totalFormatted = extracted.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      const currentWorkspaceId = workspace.id;

      await ctx.reply(
        `📋 *Datos extraídos de la factura:*\n\n` +
        `📅 Fecha: ${extracted.fecha || 'No detectada'}\n` +
        `🏢 Razón Social: ${extracted.razonSocial || 'No detectada'}\n` +
        `🆔 CUIT: ${extracted.cuit || 'No detectado'}\n` +
        `🎫 N° Comprobante: ${extracted.numeroTicket || 'No detectado'}\n` +
        `💰 Neto: ${extracted.neto ? '$' + extracted.neto.toLocaleString('es-AR') : 'No detectado'}\n` +
        `📊 IVA: ${extracted.ivaPorcentaje ? extracted.ivaPorcentaje + '%' : 'No detectado'}\n` +
        `💵 Total: *${totalFormatted}*\n\n` +
        `Confianza: ${(extracted.confidence * 100).toFixed(0)}%\n\n` +
        `¿Confirmás la carga de esta factura?`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '✅ Confirmar', callback_data: `invoice_confirm_${currentWorkspaceId}` },
              { text: '❌ Cancelar', callback_data: 'invoice_cancel' },
            ]],
          },
        }
      );
    } catch (err) {
      this.logger.error('Error procesando foto:', err);
      await ctx.reply(
        '❌ No pude procesar la imagen como factura.\n\n' +
        'Asegurate de que sea una imagen clara de una factura o comprobante.'
      );
    }
  }

  async handleDocumentMessage(ctx: MyContext) {
    const { user, workspace } = await this.getTelegramUserAndWorkspace(ctx);
    if (!user || !workspace) return;

    if (workspace.type !== 'BUSINESS') {
      await ctx.reply(
        '📄 Para procesar facturas necesitás estar en modo *Empresarial*.\n' +
        'Usá /modo para cambiar de espacio de trabajo.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const doc = ctx.message.document;

    if (!doc.mime_type || (!doc.mime_type.startsWith('image/') && doc.mime_type !== 'application/pdf')) {
      await ctx.reply('⚠️ Solo se permiten archivos de imagen (JPG, PNG) o PDF para facturas.');
      return;
    }

    try {
      const file = await ctx.api.getFile(doc.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${this.config.get('telegram.botToken')}/${file.file_path}`;

      const response = await this.fetchWithTimeout(fileUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      await ctx.reply('📄 Procesando factura...');

      const extracted = await this.invoicesService.extractInvoiceData(buffer, doc.mime_type);

      if (!extracted.total || extracted.total <= 0) {
        await ctx.reply(
          '❌ No pude detectar el total de la factura en el archivo.\n\n' +
          'Asegurate de que el documento sea legible.'
        );
        return;
      }

      ctx.session.pendingInvoice = extracted;
      ctx.session.pendingInvoiceFileUrl = null;
      ctx.session.state = 'awaiting_invoice_confirm';

      const totalFormatted = extracted.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      const currentWorkspaceId = workspace.id;

      await ctx.reply(
        `📋 *Datos extraídos de la factura:*\n\n` +
        `📅 Fecha: ${extracted.fecha || 'No detectada'}\n` +
        `🏢 Razón Social: ${extracted.razonSocial || 'No detectada'}\n` +
        `🆔 CUIT: ${extracted.cuit || 'No detectado'}\n` +
        `🎫 N° Comprobante: ${extracted.numeroTicket || 'No detectado'}\n` +
        `💰 Neto: ${extracted.neto ? '$' + extracted.neto.toLocaleString('es-AR') : 'No detectado'}\n` +
        `📊 IVA: ${extracted.ivaPorcentaje ? extracted.ivaPorcentaje + '%' : 'No detectado'}\n` +
        `💵 Total: *${totalFormatted}*\n\n` +
        `Confianza: ${(extracted.confidence * 100).toFixed(0)}%\n\n` +
        `¿Confirmás la carga de esta factura?`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '✅ Confirmar', callback_data: `invoice_confirm_${currentWorkspaceId}` },
              { text: '❌ Cancelar', callback_data: 'invoice_cancel' },
            ]],
          },
        }
      );
    } catch (err) {
      this.logger.error('Error procesando documento:', err);
      await ctx.reply(
        '❌ No pude procesar el archivo como factura.\n\n' +
        'Asegurate de que sea un PDF o imagen clara de una factura o comprobante.'
      );
    }
  }

  private async transcribeAudio(audioBase64: string): Promise<string> {
    const geminiKey = this.config.get('gemini.apiKey');
    if (!geminiKey) {
      throw new Error('Gemini API no configurada');
    }

    const gemini = new GoogleGenerativeAI(geminiKey);
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const response = await model.generateContent([
      {
        text: 'Transcribe este audio a texto. Solo devolve el texto transcrita, sin agregar nada más. El audio puede ser en español o mixto. Si no puedes transcribir, di "No se pude transcribir".',
      },
      {
        inlineData: {
          mimeType: 'audio/ogg',
          data: audioBase64,
        },
      },
    ]);

    return response.response.candidates[0].content.parts[0].text;
  }

  private async handleNewCategoryName(ctx: MyContext, text: string) {
    if (!ctx.session.workspaceId) {
      await ctx.reply('⚠️ No hay un espacio de trabajo activo. Usá /start para re-vincular tu cuenta.');
      return;
    }
    try {
      const category = await this.categoriesService.create(ctx.session.workspaceId, {
        name: text.trim(),
        icon: 'tag',
        color: '#385144',
        type: 'MIXED',
      });
      ctx.session.pendingTransaction.categoryId = category.id;
      ctx.session.pendingTransaction.categoryName = category.name;
      ctx.session.state = 'idle';
      await ctx.reply(`✅ Categoría "${this.escapeMarkdown(category.name)}" creada.`);
      await this.showConfirmation(ctx, ctx.session.pendingTransaction, category);
    } catch (err) {
      await ctx.reply(`❌ Error al crear la categoría: ${err.message}`);
      ctx.session.state = 'idle';
    }
  }

  private async handleSplitCalculation(ctx: MyContext, text: string) {
    try {
      const personRegex = /([^:,]+):\s*(\d[\d.,]*)/g;
      const people: { name: string; amount: number }[] = [];
      let match;
      while ((match = personRegex.exec(text)) !== null) {
        const name = match[1].trim();
        const amount = parseFloat(match[2].replace('.', '').replace(',', '.'));
        if (name && !isNaN(amount) && amount >= 0) {
          people.push({ name, amount });
        }
      }
      if (people.length < 2) {
        await ctx.reply('⚠️ Necesito al menos 2 personas con sus montos.\nFormato: `Persona: monto, Persona: monto`\nEjemplo: `Santiago: 15000, María: 8000`', { parse_mode: 'Markdown' });
        return;
      }
      const total = people.reduce((s, p) => s + p.amount, 0);
      const perPerson = total / people.length;
      let msg = `🧮 *Cálculo de división*\n\n`;
      msg += `Total: *${total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n`;
      msg += `Personas: ${people.length}\n`;
      msg += `Cada uno paga: *${perPerson.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n\n`;
      for (const p of people) {
        const diff = p.amount - perPerson;
        if (diff > 0) {
          msg += `• ${this.escapeMarkdown(p.name)}: pagá *${diff.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}* de más\n`;
        } else if (diff < 0) {
          msg += `• ${this.escapeMarkdown(p.name)}: le debés *${Math.abs(diff).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*\n`;
        } else {
          msg += `• ${this.escapeMarkdown(p.name)}: saldado\n`;
        }
      }
      ctx.session.state = 'idle';
      await ctx.reply(msg, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.error('Error en división:', err);
      await ctx.reply('❌ Error calculando la división.');
    }
  }

  private async askForCategory(ctx: MyContext, categories: any[], parsed: any) {
    const typeLabel = parsed.type === 'INCOME' ? 'Ingreso' : 'Gasto';
    const amount = Number(parsed.amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    ctx.session.state = 'awaiting_category';

    const relevantCats = categories
      .filter(c => c.type === 'MIXED' ||
        (parsed.type === 'EXPENSE' && c.type === 'EXPENSE') ||
        (parsed.type === 'INCOME' && c.type === 'INCOME'))
      .slice(0, 8);

    const keyboard: any[][] = relevantCats.map(c => [{
      text: `${c.icon || '🏷️'} ${c.name}`,
      callback_data: `cat_${c.id}`,
    }]);

    keyboard.push([{ text: '➕ Nueva categoría', callback_data: 'new_category' }]);
    keyboard.push([{ text: '🏠 Menú principal', callback_data: 'main_menu' }]);

    await ctx.reply(
      `${typeLabel} de *${amount}* detectado.\n` +
      `¿En qué categoría querés registrarlo?`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      }
    );
  }

  private async showConfirmation(ctx: MyContext, tx: any, category: any) {
    const typeEmoji = tx.type === 'INCOME' ? '💰' : '💸';
    const typeLabel = tx.type === 'INCOME' ? 'Ingreso' : 'Gasto';
    const amount = Number(tx.amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

    const message =
      `${typeEmoji} *${typeLabel} detectado*\n\n` +
      `💵 Monto: *${amount}*\n` +
      `🏷️ Categoría: *${this.escapeMarkdown(category?.name || tx.categoryName || 'Sin categoría')}*\n` +
      `📝 Descripción: ${this.escapeMarkdown(tx.description || '-')}\n` +
      `📅 Fecha: ${tx.date}\n\n` +
      `¿Confirmás el registro?`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Confirmar', callback_data: `confirm_${tx.type}` },
          { text: '❌ Cancelar', callback_data: 'cancel' },
          { text: '🏠 Menú principal', callback_data: 'main_menu' },
        ]],
      },
    });
  }

  async processWebhookUpdate(update: any) {
    if (!this.bot) return;
    try {
      await this.bot.handleUpdate(update);
    } catch (err) {
      this.logger.error('Error procesando webhook update:', err);
    }
  }

  async sendMessage(telegramId: string, message: string) {
    if (!this.bot) return;
    try {
      await this.bot.api.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.error(`Error enviando mensaje a ${telegramId}:`, err.message);
    }
  }
}