import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';
import { Public } from 'src/shared/decorators/auth.decorator';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post()
  postWebhook(@Req() req: Request, @Res() res: Response) {
    this.webhookService.postWebhook(req, res);
  }

  @Public()
  @Get()
  getWebhook(@Req() req: Request, @Res() res: Response) {
    this.webhookService.getWebhook(req, res);
  }
}
