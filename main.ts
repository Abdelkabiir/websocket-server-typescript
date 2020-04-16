import * as http from "http";
import { Message } from "./utils/messages";
import { WEBSOCKET_PORT, COLORS } from "./utils/constants";

var WebSocketServer = require("websocket").server;

const clients: any = [];
let history: Message[] = [];
let colors = COLORS;

var httpServer = http.createServer(() => {});
httpServer.listen(WEBSOCKET_PORT, () => {
  console.log(new Date() + " Server is listening on port " + WEBSOCKET_PORT);
});

const wsServer = new WebSocketServer({
  httpServer: httpServer,
});

function originIsAllowed(origin: any) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", (request: any) => {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log("---------------------------");
    console.log(new Date() + " Connection from origin " + request.origin + " rejected.");
    console.log("---------------------------");
    return;
  }
  let connection = request.accept(null, request.origin);
  console.log("---------------------------");
  console.log(new Date() + " Connection accepted from origin: " + request.origin);
  console.log("---------------------------");

  clients.push(connection);
  let userName = "";
  let userColor: string | undefined = "";
  if (history.length > 0) {
    connection.sendUTF(JSON.stringify({
      type: "history",
      data: history,
    }));
  }
  connection.on("message", (message: any) => {
    if (message.type === "utf8") {
      // first message sent by user is their name
      let messageObj = JSON.parse(message.utf8Data);
      let messageType = messageObj.type;
      let messageData = messageObj.data;
      if (messageType === 'userName') {
        userColor = colors.shift();
        userName = messageData;
        connection.sendUTF(JSON.stringify({
          type: "color",
          data: userColor,
        }));
        console.log("---------------------------");
        console.log(new Date() + " User is known as: " + userName + " with " + userColor + " color.");
        console.log("---------------------------");
      }
      else if(messageType === 'message') {
        console.log("---------------------------");
        console.log(new Date() + " Received Message from " + userName + ": " + messageData);
        console.log("---------------------------");
        let msg: Message = {
          time: new Date().getTime(),
          text: messageData,
          author: userName,
          color: userColor,
        };
        history.push(msg);
        history = history.slice(-100);
        // broadcast message to all connected clients
        let json = JSON.stringify({ type: "message", data: msg });
        for (let i = 0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    } else if (message.type === "binary") {
      // Not needed since we're only sending text messages, for now.
      console.log("---------------------------");
      console.log("Received Binary Message of " + message.binaryData.length + " bytes");
      console.log("---------------------------");
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on("close", (reasonCode: any, description: any) => {
    console.log("---------------------------");
    console.log(new Date() + " Peer at :" + connection.remoteAddress + " disconnected.");
    console.log("Reason code: ", reasonCode);
    console.log("Description: ", description);
    console.log("---------------------------");
  });
});
