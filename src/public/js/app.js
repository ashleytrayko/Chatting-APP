// const messageList = document.querySelector('ul');
// const nickForm = document.querySelector('#nick');
// const messageForm = document.querySelector('#message');
// const socket = new WebSocket(`ws://${window.location.host}`); // 소켓 생성

// // JSON 타입을 String 으로 변환
// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// // 소켓 연결시 이벤트
// socket.addEventListener('open', () => {
//   console.log('Connected to Server ✅');
// });

// // 메시지 수신시 이벤트
// socket.addEventListener('message', (message) => {
//   const li = document.createElement('li');
//   li.innerText = message.data;
//   messageList.append(li);
// });

// // 연결 해제 시 이벤트
// socket.addEventListener('close', () => {
//   console.log('Disconnected from Server❌');
// });

// // 메시지 전송 함수
// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageForm.querySelector('input');
//   socket.send(makeMessage('new_message', input.value));
//   input.value = '';
// }

// // 닉네임 설정 함수
// function handleNickSubmit(event) {
//   event.preventDefault();
//   const input = nickForm.querySelector('input');
//   socket.send(makeMessage('nickname', input.value));
//   input.value = '';
// }

// messageForm.addEventListener('submit', handleSubmit);
// nickForm.addEventListener('submit', handleNickSubmit);

// --------------------------socket.io---------------------
const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#name input');
  socket.emit('nickname', input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nameForm.addEventListener('submit', handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined!`);
});

socket.on('bye', (left, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left~`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});
