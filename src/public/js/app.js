const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');
const socket = new WebSocket(`ws://${window.location.host}`); // 소켓 생성

// JSON 타입을 String 으로 변환
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 소켓 연결시 이벤트
socket.addEventListener('open', () => {
  console.log('Connected to Server ✅');
});

// 메시지 수신시 이벤트
socket.addEventListener('message', (message) => {
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});

// 연결 해제 시 이벤트
socket.addEventListener('close', () => {
  console.log('Disconnected from Server❌');
});

// 메시지 전송 함수
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(makeMessage('new_message', input.value));
  input.value = '';
}

// 닉네임 설정 함수
function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
  input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);
