import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app); // http server
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
}); //socket.io
instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const { rooms, sids } = wsServer.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRooms(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous';
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRooms(roomName)); //하나의 소켓에 메시지 전송
    wsServer.sockets.emit('room_change', publicRooms()); //모든 소켓에 메시지 전송
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countRooms(room) - 1)
    );
  });

  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });

  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
});

//const wss = new WebSocket.Server({ server }); // http와 wss 를 같이 돌림

// const sockets = [];

// // webSocket event사용
// wss.on('connection', (socket) => {
//   // 소켓 연결시 배열에 삽입
//   sockets.push(socket);

//   // 소켓에 데이터를 저장할 수 있음
//   socket['nickname'] = 'Anonymous';

//   console.log('Connected to Browser ✅');
//   socket.on('close', () => console.log('Disconnected from the Browser❌'));
//   socket.on('message', (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case 'new_message':
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       case 'nickname':
//         socket['nickname'] = message.payload;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
