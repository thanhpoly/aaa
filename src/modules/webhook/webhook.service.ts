import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'request';

@Injectable()
export class WebhookService {
  constructor(private configService: ConfigService) {}
  postWebhook(req, res) {
    const body = req.body;

    console.log(`\u{1F7EA} Received webhook:`);
    console.dir(body, { depth: null });
    if (body.object === 'page') {
      body.entry.forEach(function (entry) {
        // Get the webhook event. entry.messaging is an array, but
        // will only ever contain one event, so we get index 0
        const webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        const sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        if (webhook_event.message) {
          this.handleMessage(sender_psid, webhook_event.message);
        }
      });
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }

  handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {
      // Create the payload for a basic text message
      response = {
        text: `You sent the message: "${received_message.text}". Now send me an image!`,
      };
    }

    // Sends the response message
    this.callSendAPI(sender_psid, response);
  }

  callSendAPI(sender_psid, response) {
    const request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };

    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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
        res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }
}
