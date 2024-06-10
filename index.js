const { credential } = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const https = require("https");

const express = require("express");

const server = express();

var cors = require('cors');
server.use(cors());

server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const app = initializeApp({
  credential: credential.cert({
    type: "service_account",
    project_id: "kmr-and-friends",
    private_key_id: "b991f4b20393a5d727c9efbf83920f0078626a38",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDmcFusaXi4bW/9\nNrxR+ofsgM+BdbClz1LvosutlXv9gs524xmflK5w33bXrW2rlT+KSgkT5lxTjIqQ\n0PcFswOoOGc9K5jk+OW+5zzVCysDEwjHqEnIEWMrV0uCjbycMuSDuOMr6w3IfsAM\nkkSAHqEF018aEt2pOtvZNCspojFxu77zjkf7msif2KpzOGkVWQFhPrk/CgqknLYT\nN99leJBz9QF8LICs/WL5S2GZi/kIdSZWTgvXtRDN3lLJGHEp1/6TfdhMt50ZjkBl\nEG3ZGqjJkVXe+wcfdu6RDgix1WuaaOm+Hg59KClw7XqNinu7XP6i04E1Xnip/DAR\nlnxxHMPRAgMBAAECggEAS3DqWkoXVw2g9b2HLrF98VwEUyZEBCyZQtHBq5z+QDMk\nQ8C6oUdsSpCmGBrzhhJxAGWXjjfC7ylaLenzjR6bqmV4ywpsXj3r/TE39alX1gRT\nwgWizgh/Nm+4TU/4uQxiSotrd/PWidaRKixyl50vazhVcLRPdDlMQ1I0dUdft5M3\nxwa/UhMnhJ7qBjeo8KYLpjJDHdKT0xz0H8Tik0xS9HODTCUCXf0Zqv0WXx00Dnl8\ndNh4+ejNdh76bAjml+iDxO9W7jGHCt4iicC7eulOaqVQSUwSQTIUTpMJ4ic9wp4Y\nSX5i2EWIDeastWaSf2+WOcGyw22Inocz1AWI/ip9jwKBgQD/bM4nmfG6CL9RjSYD\nR8kb0gOJKtAB2YF05yBHyzqUQlcA/3yBnNhMD7Pt6eFCujNTXIF74PVVxMKeE4Uf\n95Lc5Vdh3Ot5vomp+0aeg5EVxgN/5bzenXVgs+Gdz4ElHGIs3GSIkWPzC5ZwO9Ir\nbpr7yGmEGizzEaHyGFuLK3WZFwKBgQDm9SdqMusZAl8cKjkvhzBzo5NlGjPAJSbH\nGkQhB4HzbT16SKA9jJxKf3x1SeIAYBm17hzjdQfLId+Fo4BHVk1qfnCt44Xw9p9p\n/7l18kAjCqsllJU8JnA9AE1cgpaFYsUoEaDYKgJuqRRPpbWqgleMgsC/5rVcPT0I\n+fKhYZRLVwKBgErpiWj58HhkWmA7qntp0WTUam8PXGQ+e4ZixwfnZe3XqxbC16xX\n6OQd8uKDJqrgW29GgT9o0etuwrmD9hZTEQKyTLeKCJHzPQLajHKvGZ0uLxaStZsA\nyU0sVK5pDnJo6a5IkT+wjITa0CtokBJm5ROVSsUQvEAp2rpbRHYDsADPAoGBALax\nG/GMv51z28pKuBuZg8EllpV2CZOnj6oVY+kAqFHniqbtRhwJ2yOu/sNEo0qKuivI\nY/+k9no/nDF5KSLE6M4hoH5cqPn4DBfsGkdrTkKp0MIUa4w+F7CZSZixD+IJRE2y\nzBnR+USR6KgsO6zaF+jlERV7qOCC7IHqPXxc1NJXAoGBAPcVLg7pFVAOr/7jfYgc\nsqBPKN1RErrQTfwS+yfKcfWsHfKLoOTTwPqO40G6IQEhf7D1ZtJyfbABbh4imh5J\nHfm1uJ3EvDNGSgfrU9epgvQ8d4bBPpheiaVU7LQy10TSm7YpQoTVo4YErOgzwlNh\nbDh93UzOnZi+ZTJ64/mqHx4N\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-v9dgz@kmr-and-friends.iam.gserviceaccount.com",
    client_id: "118116752206704505590",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-v9dgz%40kmr-and-friends.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});


server.use(express.json());
server.get("/newchat", (req, res) => {
  let body = req.body;
  console.log("Notification request received GET");
  return;
  const message = {
    notification: {
      title: `New Chat Request from ${body.from}!`,
      body: ``,
      imageUrl: "https://my-cdn.com/app-logo.png",
    },
    token: `${body.token}`,
  };

  try {
    getMessaging()
      .send(message)
      .then((response) => {
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(registrationTokens[idx]);
            }
          });
          console.log("List of tokens that caused failures: " + failedTokens);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    console.log(e);
  }
});

server.post("/newchat", (req, res) => {
  let body = req.body;
  console.log("Notification request received");
  const message = {
    notification: {
      title: `New Chat Request from ${body.from}!`,
      body: ``,
      imageUrl: "https://my-cdn.com/app-logo.png",
    },
    token: `${body.token}`,
  };

  try {
    getMessaging()
      .send(message)
      .then((response) => {
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(registrationTokens[idx]);
            }
          });
          console.log("List of tokens that caused failures: " + failedTokens);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    console.log(e);
  }
  res.status(200)
});

server.listen(7070);
