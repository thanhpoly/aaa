import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'request';
import { ERROR } from 'src/constants/exception.constant';
import { BaseException } from 'src/shared/filters/exception.filter';

@Injectable({})
export class WebhookService {
  constructor(private configService: ConfigService) {}
  postWebhook(body: { object: string; entry: any[] }) {
    console.log(`\u{1F7EA} Received webhook:`);
    console.dir(body, { depth: null });

    if (body.object === 'page') {
      body.entry.forEach(function (entry) {
        const webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        const sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        if (webhook_event.message) {
          return this.handleMessage(sender_psid, webhook_event.message);
        }
      });

      return 'EVENT_RECEIVED';
    } else {
      throw new BaseException(ERROR.NOT_FOUND);
    }
  }

  handleMessage(sender_psid: string, received_message: { text: string }) {
    let result;

    if (received_message.text) {
      result = {
        text: `You sent the message: "${received_message.text}". Now send me an image!`,
      };
    }

    return this.callSendAPI(sender_psid, result);
  }

  callSendAPI(sender_psid: string, result: string) {
    const request_body = {
      recipient: {
        id: sender_psid,
      },
      message: result,
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
