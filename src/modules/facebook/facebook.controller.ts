import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../shared/decorators/auth.decorator';
import { FacebookService } from './facebook.service';

@Controller('webhook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post()
  postWebhook(@Body() body: { object: string; entry: any[] }): void {
    return this.facebookService.postWebhook(body);
  }

  @Public()
  @Get()
  getFacebookWebhook(@Req() req: Request, @Res() res: Response) {
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
