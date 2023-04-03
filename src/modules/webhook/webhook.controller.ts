import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';
import { Public } from 'src/shared/decorators/auth.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post()
  postWebhook(@Body() body: { object: string; entry: any[] }): void {
    return this.webhookService.postWebhook(body);
  }

  @Public()
  @Get()
  getWebhook(@Req() req: Request, @Res() res: Response) {
    const verifyToken: string = this.configService.get<string>('VERIFY_TOKEN');
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
  }
}
