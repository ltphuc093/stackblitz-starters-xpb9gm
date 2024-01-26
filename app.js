const express = require("express");
const { join } = require('node:path');
const { WebSocketServer } = require('ws');
const app = express();
const wss = new WebSocketServer({ port: 443  });
const port = process.env.PORT || 8000;
wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
  });
