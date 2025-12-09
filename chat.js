// chat.js
import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';

// КЛІЄНТ підключається без role => role = 'client'
const socket = io('http://10.0.0.53:3000');

const chatBtn = document.getElementById('chat-btn');
const chatBox = document.getElementById('chat-box');
const messagesEl = document.getElementById('chat-messages');
const inputEl = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');

const authBox = document.getElementById('chat-auth');
const nameInput = document.getElementById('auth-name');
const authSave = document.getElementById('auth-save');

let username = localStorage.getItem('chatName') || '';

chatBtn.addEventListener('click', () => {
  chatBox.classList.add('open');
  if (!username) {
    authBox.hidden = false;
  }
});

authSave.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) return;
  username = name;
  localStorage.setItem('chatName', username);
  authBox.hidden = true;
});

function addMessage(msg, fromSelf = false) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';

  if (msg.role === 'admin') {
    bubble.classList.add('chat-bubble--admin');
  } else if (fromSelf) {
    bubble.classList.add('chat-bubble--me');
  }

  const label = msg.role === 'admin'
    ? 'Support'
    : msg.sender || 'Client';

  bubble.textContent = `${label}: ${msg.text}`;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage() {
  if (!username) {
    authBox.hidden = false;
    return;
  }

  const text = inputEl.value.trim();
  if (!text) return;

  const msg = { sender: username, text };

  // свій месседж покажемо після відповіді сервера (fullMsg)
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

// сервер завжди шле fullMsg з role
socket.on('chat message', (msg) => {
  const fromSelf = (msg.sender === username && msg.role === 'client');
  addMessage(msg, fromSelf);
});
