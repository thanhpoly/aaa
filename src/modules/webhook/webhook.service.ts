import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'request';
import { ERROR } from 'src/constants/exception.constant';
import { BaseException } from 'src/shared/filters/exception.filter';

@Injectable({})
export class WebhookService {
  constructor(private configService: ConfigService) {}

  postWebhook(body: { object: string; entry: any[] }): void {
    if (body.object === 'page') {
      body.entry.forEach(async (entry) => {
        const webhook_event = entry.messaging[0];

        const sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid)

        if (webhook_event.message) {
          return await this.handleMessage(sender_psid, webhook_event.message);
        }
      });
    } else {
      throw new BaseException(ERROR.NOT_FOUND);
    }
  }

  async handleMessage(sender_psid: string, received_message: { text: string }) {
    let response;

    if (received_message.text) {
      response = {
        text: `You sent the message: "${received_message.text}"`,
      };
    }

    return await this.callSendAPI(sender_psid, response);
  }

  async callSendAPI(
    sender_psid: string,
    response: { text: string },
  ): Promise<void> {
    const request_body: {
      recipient: { id: string };
      message: { text: string };
    } = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };
    const callApi = (): Promise<void> => {
      return new Promise<void>((resolve, reject): void => {
        request(
          {
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: this.configService.get('PAGE_ACCESS_TOKEN') },
            method: 'POST',
            json: request_body,
          },
          (err, _res, _body) => {
            if (!err) {
              console.log('message sent!');
              resolve();
            } else {
              console.error('Unable to send message:' + err);
              reject(err);
            }
          },
        );
      });
    };

    await callApi();
  }
}
