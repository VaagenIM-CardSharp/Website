// admin-chat.js
import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';

// АДМІН підключається з role=admin
const socket = io('http://10.0.0.53:3000', {
  query: { role: 'admin' }
});

const messagesEl = document.getElementById('admin-messages');
const inputEl = document.getElementById('admin-input');
const sendBtn = document.getElementById('admin-send');

let adminName = localStorage.getItem('adminName') || 'Support';

if (!localStorage.getItem('adminName')) {
  const name = prompt('Admin name (optional):', 'Support');
  if (name && name.trim()) {
    adminName = name.trim();
    localStorage.setItem('adminName', adminName);
  }
}

function addMessage(msg) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';

  if (msg.role === 'admin') {
    bubble.classList.add('chat-bubble--admin');
  } else if (msg.role === 'client') {
    bubble.classList.add('chat-bubble--client');
  }

  const label = msg.role === 'admin'
    ? `Support (${msg.sender})`
    : msg.sender || 'Client';

  bubble.textContent = `${label}: ${msg.text}`;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  const msg = { sender: adminName, text };
  socket.emit('chat message', msg);
  inputEl.value = '';
}

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

socket.on('chat message', (msg) => {
  addMessage(msg);
});
