import { TelegramService } from './telegram.service';
export declare class TelegramController {
    private telegramService;
    constructor(telegramService: TelegramService);
    handleWebhook(update: any): Promise<{
        ok: boolean;
    }>;
}
