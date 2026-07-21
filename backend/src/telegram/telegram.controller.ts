import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de Telegram (público)' })
  async handleWebhook(@Body() update: any) {
    await this.telegramService.processWebhookUpdate(update);
    return { ok: true };
  }
}
