import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'request';
import { ERROR } from 'src/constants/exception.constant';
import { BaseException } from 'src/shared/filters/exception.filter';
import { WebhookDto } from './dto/webhook-request';

@Injectable({})
export class WebhookService {
  constructor(private configService: ConfigService) {}
  postWebhook(body: any) {
    console.log(`\u{1F7EA} Received webhook:`);
    console.dir(body, { depth: null });

    if (body.object === 'page') {
      body.entry.forEach(async function (entry) {
        const webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        const sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        console.log('b', webhook_event.message);

        if (webhook_event.message) {
          const a = this.handleMessage(sender_psid, webhook_event.message);
          console.log('a', a);
          return a;
        }
      });
    } else {
      throw new BaseException(ERROR.NOT_FOUND);
    }
  }

  handleMessage(sender_psid: string, received_message: { text: string }) {
    console.log('sender_psid', sender_psid);
    console.log('received_message', received_message);
    let response;

    if (received_message.text) {
      response = {
        text: `You sent the message: "${received_message.text}". Now send me an image!`,
      };
    }

    // Sends the response message
    const a = this.callSendAPI(sender_psid, response);
    console.log('a', a);
    return a;
  }

  callSendAPI(sender_psid: string, response: { text: string }) {
    console.log('sender_psid', sender_psid);
    console.log('response', response);
    const request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };

    const aa = request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: this.configService.get('PAGE_ACCESS_TOKEN') },
        method: 'POST',
        json: request_body,
      },
      (err, res, body) => {
        if (!err) {
          console.log('message sent!');
        } else {
          console.error('Unable to send message:' + err);
        }
      },
    );
    console.log('aa', aa);
    return aa;
  }
}
