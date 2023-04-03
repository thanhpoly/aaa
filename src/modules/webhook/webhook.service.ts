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
      body.entry.forEach(function (entry) {
        const webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        const sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        console.log('b', webhook_event.message);

        if (webhook_event.message) {
          const a = this?.handleMessage(sender_psid, webhook_event.message);
          console.log('a', a);
          return a;
        }
      });
    } else {
      throw new BaseException(ERROR.NOT_FOUND);
    }
  }

  handleMessage(sender_psid: string, received_message: { text: string }) {
    let response;

    if (received_message.text) {
      response = {
        text: `You sent the message: "${received_message.text}". Now send me an image!`,
      };
    }

    const aa = this.callSendAPI(sender_psid, response);
    console.log('aaa', aa);
  }

  callSendAPI(sender_psid: string, response) {
    const request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };

    console.log('accesstoken', this.configService.get('PAGE_ACCESS_TOKEN'));
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: this.configService.get('PAGE_ACCESS_TOKEN') },
        method: 'POST',
        json: request_body,
      },
      (err, res, body) => {
        console.log('body', body);
        if (!err) {
          console.log('message sent!');
        } else {
          console.error('Unable to send message:' + err);
        }
      },
    );
  }

  getWebhook(req, res) {
    const verifyToken = this.configService.get('VERIFY_TOKEN');
    console.log('verifyToken', verifyToken);
    // Parse the query params
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === verifyToken) {
        // Respond with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        return res.sendStatus(403);
      }
    }
  }
}
