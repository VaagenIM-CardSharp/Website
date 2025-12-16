// chat-client.js

let socket = null;
let userName = '';
const SERVER_URL = 'http://10.0.0.53:3000'; // твій Node-сервер

// чекаємо доки DOM завантажиться
document.addEventListener('DOMContentLoaded', () => {
  const authCard   = document.getElementById('chat-auth');
  const authInput  = document.getElementById('auth-name');
  const authSave   = document.getElementById('auth-save');
  const messagesEl = document.getElementById('chat-messages');
  const inputEl    = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('chat-send');

  // натиснули "Start chat"
  authSave.addEventListener('click', () => {
    const name = authInput.value.trim();
    if (!name) return;

    userName = name;
    authCard.hidden = true;           // ховаємо картку з ім'ям
    ensureSocket();                   // підключаємось до сокета
  });

  // відправка повідомлення
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !socket || !userName) return;

    socket.emit('chat message', {
      text,
      name: userName          // ім'я клієнта – сервер просто прокине далі
    });

    inputEl.value = '';
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // функція, яка точно створює підключення тільки один раз
  function ensureSocket() {
    if (socket) return;

    try {
      socket = io(SERVER_URL, {
        query: { role: 'client', name: userName },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('Client socket connected:', socket.id);
      });

      // отримали повідомлення з сервера
      socket.on('chat message', (msg) => {
        // msg: { text, name, role, time }
        addMessage(msg, msg.role === 'admin' ? 'admin' : 'client');
      });

      socket.on('disconnect', () => {
        console.log('Client socket disconnected');
      });

    } catch (err) {
      console.error('Socket.IO error:', err);
    }
  }

  // малюємо одну «бульку» в чаті
  function addMessage(msg, who) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg chat-msg--${who}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble';
    bubble.textContent = msg.text || '';

    const meta = document.createElement('div');
    meta.className = 'chat-msg__meta';
    const time = msg.time ? new Date(msg.time) : new Date();
    meta.textContent = `${msg.name || ''} • ${time.toLocaleTimeString()}`;

    wrapper.appendChild(bubble);
    wrapper.appendChild(meta);

    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
});
