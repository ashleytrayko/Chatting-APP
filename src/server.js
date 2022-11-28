import http from 'http';
import WebSocket from 'ws';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app); // http server
const wss = new WebSocket.Server({ server }); // http와 wss 를 같이 돌림
const sockets = [];

// webSocket event사용
wss.on('connection', (socket) => {
  // 소켓 연결시 배열에 삽입
  sockets.push(socket);

  // 소켓에 데이터를 저장할 수 있음
  socket['nickname'] = 'Anonymous';

  console.log('Connected to Browser ✅');
  socket.on('close', () => console.log('Disconnected from the Browser❌'));
  socket.on('message', (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case 'new_message':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case 'nickname':
        socket['nickname'] = message.payload;
    }
  });
});

server.listen(3000, handleListen);
