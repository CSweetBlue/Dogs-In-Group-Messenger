/*
 * Dogs In Group Messenger provides some much need mental health relief.
 * Find the "Dogs In Group Messenger" and start a message. Message us "dog"
 * and see what happens.
 * 
 * Project framework provided through the "Starter Project for Messenger 
 * Platform Quick Start Tutorial". Great documentation over there to get
 * started and put your own twist on a Messenger bot.
 */

'use strict';

// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  randomPuppy = require('random-puppy'),
  app = express().use(body_parser.json()); // creates express http server
  
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

//When enabled, sends 5x reponse until disabled.
let dogOverload = false;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
      
      // Check if the event is a message or postback, and
      // passes the event to the appropriate hander.
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback); 
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "RandomTokenForVerification";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {

  let response;
  
  if (received_message.text) {
    
    //No caps on purpose.
    if (received_message.text.includes(" dog ") ||
        received_message.text.includes(" dog")  ||
        received_message.text.includes("dog ")  || 
        received_message.text == ("dog")          ){
      
      let sendCount = 1;
      
      if (dogOverload) {
        sendCount = 5;
      }
      
      for (let i = 0; i < sendCount; i++) {
        randomPuppy().then(result => {

          response = {
            "attachment":{
              "type":"image", 
              "payload":{
                "url":result, 
                "is_reusable":true
              }
            }
          }

          callSendAPI(sender_psid, response);
        });
      }
      
    } else if (received_message.text == "Dog overload."){
      
      dogOverload = true;
      
    } else if (received_message.text == "Stop overload."){
      
      dogOverload = false;
      response = {"text": "Overload disabled."}
      callSendAPI(sender_psid, response);
      
    } else {

    }
  }
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  
  let request_body = {
    "recipient": {
      "id": sender_psid 
    },
    "message": response
  }
  
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}