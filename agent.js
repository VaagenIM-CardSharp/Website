// js/agent.js
// Firestore-powered agent console (no auth; demo rules required)

// --- Firebase (CDN modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// --- Your config (same as on the site)
const firebaseConfig = {
  apiKey: "AIzaSyCfXt2YFfrTF0h0bxuh0uAL7VyC7waqTNOE",
  authDomain: "cardsharp-chat.firebaseapp.com",
  projectId: "cardsharp-chat",
  storageBucket: "cardsharp-chat.firebasestorage.app",
  messagingSenderId: "21085363631",
  appId: "1:21085363631:web:f10be98af4dab37aefa75a",
  measurementId: "G-FFNVQHSXHR",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// --- UI refs
const userListEl   = document.getElementById("userList");
const chatHeaderEl = document.getElementById("chatHeader");
const chatMsgsEl   = document.getElementById("chatMessages");
const inputEl      = document.getElementById("messageInput");
const sendBtn      = document.getElementById("sendBtn");

let currentConvId = null;
let unsubscribeThread = null;

// --- Helpers
const fmtName = (s) => (s && s.trim()) ? s.trim() : "Guest";

// Render one bubble (glass style classes come from agent.css)
function renderBubble({ role, text }) {
  const div = document.createElement("div");
  div.className = "cs-msg " + (role === "agent" ? "cs-msg--agent" : "cs-msg--user");
  div.textContent = text || "";
  return div;
}

// --- Load & render conversation list
const conversationsQ = query(collection(db, "conversations"), orderBy("lastAt", "desc"));
onSnapshot(conversationsQ, (snap) => {
  userListEl.innerHTML = "";
  if (snap.empty) {
    const li = document.createElement("li");
    li.textContent = "No conversations yet…";
    li.style.opacity = "0.7";
    userListEl.appendChild(li);
    return;
  }

  snap.forEach((d) => {
    const data = d.data() || {};
    const li = document.createElement("li");
    li.dataset.id = d.id;
    li.innerHTML = `
      <div style="font-weight:600">${fmtName(data.name)}</div>
      <div style="opacity:.7; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${data.lastMessage || ""}
      </div>
    `;
    li.addEventListener("click", () => selectConversation(d.id, fmtName(data.name)));
    userListEl.appendChild(li);
  });
});

// --- Select a conversation and stream its messages
function selectConversation(convId, displayName) {
  if (unsubscribeThread) { unsubscribeThread(); unsubscribeThread = null; }
  currentConvId = convId;
  chatHeaderEl.textContent = displayName;
  chatMsgsEl.innerHTML = "Loading…";

  const msgsQ = query(collection(db, "conversations", convId, "messages"), orderBy("createdAt", "asc"));
  unsubscribeThread = onSnapshot(msgsQ, (snap) => {
    chatMsgsEl.innerHTML = "";
    snap.forEach((d) => {
      const m = d.data();
      chatMsgsEl.appendChild(renderBubble(m));
    });
    chatMsgsEl.scrollTop = chatMsgsEl.scrollHeight;
  });
}

// --- Send message as agent
async function sendMessage() {
  const text = (inputEl.value || "").trim();
  if (!text) return;
  if (!currentConvId) {
    alert("Select a user from the left list first.");
    return;
  }
  const convRef = doc(db, "conversations", currentConvId);

  await addDoc(collection(convRef, "messages"), {
    role: "agent",
    text,
    createdAt: serverTimestamp(),
  });

  await setDoc(convRef, { lastMessage: text, lastAt: serverTimestamp() }, { merge: true });

  inputEl.value = "";
  inputEl.focus();
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// --- Optional: auto-select first conversation when list loads
// (keeps trying until there is at least one item)
const autoPick = setInterval(() => {
  if (currentConvId) { clearInterval(autoPick); return; }
  const first = userListEl.querySelector("li[data-id]");
  if (first) {
    first.click();
    clearInterval(autoPick);
  }
}, 400);
