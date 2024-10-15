const { credential } = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  countries,
  names,
  starWars,
} = require("unique-names-generator");

const https = require("https");
const express = require("express");
const server = express();
var cors = require("cors");
const screenName = require("./screens");
const Config = require("./config");



const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');

var exec = require("child_process").exec;

server.use(cors());

server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const app = initializeApp({
  credential: credential.cert(Config.firebaseAdminConfig),
});

server.get("/", (req, res) => {
  res.send("<h4> Notification API Up!");
});

server.use(express.json());

server.post("/gitpull", (req, res) => {
  if (req.body.pass != "mayur") return res.send("Access Denied");
  var result = function (command, cb) {
    var child = exec(command, function (err, stdout, stderr) {
      if (err != null) {
        return cb(new Error(err), null);
      } else if (typeof stderr != "string") {
        return cb(new Error(stderr), null);
      }
      {
        return cb(null, stdout);
      }
    });
    return child;
  };

  try {
    let re = [];
    let gitpull = result("git pull", (err, s) => {
      if (!err) {
        console.log(re);
        re.push("[SUCCESS] : " + s);
      } else {
        re.push("[ERROR] : " + JSON.stringify(err));
      }
    });
    let pm2restart = result("pm2 restart index", (err, s) => {
      if (!err) {
        re.push("[SUCCESS] : " + s);
      } else {
        re.push("[ERROR] : " + JSON.stringify(err));
      }
    });
    res.send(re.join("<br>"));
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

server.get("/newchat", (req, res) => {
  try {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
    }); // big_red_donkey

    const shortName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
      length: 2,
    });
  } catch (e) {
    console.log(e);
  }
});

/*
@REQ BODY
{
type : c = CUSTOM | cr = CHAT REQUEST | cra = REQUEST ACCEPT | crd = REQUEST DECLINE  | msg = NEW MESSAGE | exp = CHAT EXPIRES,
tokens : Array,
from : Listener | User,
data? : String

title? : String // for custom
body? : String // for custom
}
*/

server.post("/chatnotification", (req, res) => {
  console.log(" \n Notification request received \n");

  console.log(req.body);

  let title,
    body,
    screen = "null";

  switch (req.body.type) {
    case "c":
      {
        title = req.body.title;
        body = `${req.body.body}`;
        screen = "Notification";
      }
      break;

    case "cr":
      {
        title = "New Chat Request";
        body = `${req.body.from.name} wants to have a chat!`;
      }
      break;

    case "cra":
      {
        title = "Chat request accepted";
        body = `${req.body.from.name} accepted your chat request and waiting for you to join!`;
        screen = screenName.ListenerScreen;
      }
      break;

    case "crc":
      {
        title = "Chat request cancelled";
        body = `${req.body.from.name} cancelled the chat request!`;
        screen = screenName.ListenerScreen;
      }
      break;

    case "crd":
      {
        title = "Chat request declined";
        body = `${req.body.from.name} is busy with another user. Try booking a session with other listeners.`;
      }
      break;

    case "cend":
    case "exp":
      {
        title = `Chat ended`;
        body = `Your chat with ${req.body.from.name} has ended.`;
      }
      break;

    case "msg":
      {
        title = `${req.body.from.name}`;
        body = `${req.body.data}`;
      }
      break;
  }
  let logs = [];

  

  if (typeof req.body.tokens == typeof "a") {
    let token = req.body.tokens;
    const message = {
      notification: {
        title: title,
        body: body,
        imageUrl: "https://my-cdn.com/app-logo.png",
      },
      token: `${token}`,
      data: { screen: screen },
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
            logs.push(`[SUCCESS] :  (${token})`);
            console.log(`${logs} \n 1`)
         res.send(logs.join("\n"));

          }
        })
        .catch((e) => {
          console.log(e);
          logs.push(`[ERROR] : ${e.message}  (${token})`);
          console.log(`${logs} \n 2`)

          res.send(logs.join("\n"));

        });
    } catch (e) {
      logs.push(`[ERROR] : ${e.message}  (${token})`);
      console.log(`${logs} \n 3`)

      res.send(logs.join("\n"));


    }
  } else {
    req.body.tokens.forEach((token,i) => {
      const message = {
        notification: {
          title: title,
          body: body,
          imageUrl: "https://my-cdn.com/app-logo.png",
        },
        token: `${token}`,
        data: { screen: screen },
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
              console.log(
                "List of tokens that caused failures: " + failedTokens
              );
            }
            logs.push(`[SUCCESS] :  (${token})`);
            if(i == req.body.tokens.length - 1) res.send(logs.join("\n"));
          })
          .catch((e) => {
            console.log(e);
            logs.push(`[ERROR] : ${e.message}  (${token})`);

            if(i == req.body.tokens.length - 1)   res.send(logs.join("\n"));
          });
      } catch (e) {
        logs.push(`[ERROR] : ${e.message}  (${token})`);

        if(i == req.body.tokens.length - 1)   res.send(logs.join("\n"));
      }
    });
  }

});

//process.on("uncaughtException", crashLog);

function crashLog(e) {
  let tokens = [
    "eK8YZztUS4yL6tn5ZR10r6:APA91bHEUwgEmCefUEqFf4y7tz0SJPl-ZLiEqm45V8ZUgCySCa1p4E5ttxJdIPvOlCyQTEMwpvsO3NSiQQmFIPvCpdf5UrzI767_Wf9AhOPRsrKf9ufDLE3lLCX6r3Tqij_8-XOTRUB6",
    "cs0Z5KaOT7yDE9t1ncxf0H:APA91bHch7rnO1xpvQ8A2qTzavvJsnnYxiGDNn1f6IbYH3V_2Jv-spa_hEDrw2HJbXfRQQo2_CQmV8ui_HwJkUmqZ6pu9Oe_ZW1T9k8_aJw-HLHA9yJ8-gnqA6k9XYgv3ecmIfMMm6kD",
    "c1pTPyvfSmGLa4I2ejIfYS:APA91bFqICSAoziEHElfnQ1VTZp8g42sm9m4TIlhVlshpGGFvF9DV6anyzVSVyRkyvMvfqDBj2P4I-yCnPj2MSBUcgKAoNR-2CDZ1jbLyAkBQQLny0PwPg_szam2RE3i6ZiKMF5O15FA",
  ];

  const message = {
    notification: {
      title: `New Chat Request!`,
      body: `Rizaxe wants to have a chat!`,
      imageUrl: "https://my-cdn.com/app-logo.png",
    },
    token: `fMorJMcgQgKfrRER5ghsW0:APA91bG90NskS_0ODChj4v4WEk1vXo1jVaN61MtZ-XQDZWJ3wY1hgdvRCqThzfz9lIMaqQCwcCA0a64Z4XKjB1iPW4H_sZllybXGhHlR1fyIgq4B4T4yOYlNqeApR9YUky0FCDGDjheB`,
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
}






// Parse URL-encoded bodies
server.use(bodyParser.urlencoded({ extended: true }));

server.post('/submitpartnerdetails', async (req, res) => {
    try {
        // Extract the 'entries' parameter (URL-encoded JSON string)
        const { entries, entry_id, form_id, version, file_uploads, referrer_url } = req.body;

        // Parse the 'entries' JSON string from URL-encoded format
        const parsedEntries = JSON.parse(entries);

        const data = {
          entries: entries,            // Send entries as it is
          entry_id: entry_id,          // Forward additional parameters
          form_id: form_id,
          version: version,
          file_uploads: file_uploads,
          referrer_url: referrer_url
      };
      console.log(data)

      // Send a POST request to the Frappe API
      const response = await axios.post('localhost:8000/api/method/api.api.submit_partner_details', querystring.stringify(data), {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });

      console.log(response)

        // Send Frappe's response back to the client
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error('Error sending data to Frappe API:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error processing the request'
        });
    }
});


let port = 7070;
server.listen(port, (err) => {
  if (err) throw new Error(err);
  console.log("Listening on 7070");
});
