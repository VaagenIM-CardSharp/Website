// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCfXt2YFfrTF0h0bxuh0uAL7VyC7waqTNOE",
  authDomain: "cardsharp-chat.firebaseapp.com",
  projectId: "cardsharp-chat",
  storageBucket: "cardsharp-chat.firebasestorage.app",
  messagingSenderId: "21085363631",
  appId: "1:21085363631:web:f10be98af4dab37aefa75a",
  measurementId: "G-FFNVQHSXHR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const chatBtn = document.getElementById("chat-btn");
const chatBox = document.getElementById("chat-box");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const authBox = document.getElementById("chat-auth");
const authName = document.getElementById("auth-name");
const authSave = document.getElementById("auth-save");

// Toggle chat window
chatBtn.addEventListener("click", () => {
  chatBox.classList.toggle("open");
});

// Get or create user ID
let userId = localStorage.getItem("chat_uid");
if (!userId) {
  userId = "u_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("chat_uid", userId);
}

let userName = localStorage.getItem("chat_name");

// Ask for name if not set
if (!userName) {
  authBox.style.display = "flex";
} else {
  authBox.style.display = "none";
  initChat();
}

// Save user name
authSave.addEventListener("click", async () => {
  const name = authName.value.trim();
  if (!name) return;
  localStorage.setItem("chat_name", name);
  userName = name;

  await setDoc(doc(db, "conversations", userId), {
    name,
    createdAt: serverTimestamp(),
  });

  authBox.style.display = "none";
  initChat();
});

// Allow pressing Enter to save name
authName.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    authSave.click();
  }
});

// Initialize chat
function initChat() {
  const msgRef = collection(db, "conversations", userId, "messages");
  const q = query(msgRef, orderBy("createdAt"));

  // Listen for new messages
  onSnapshot(q, (snapshot) => {
    chatMessages.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.classList.add(msg.role === "agent" ? "cs-msg--agent" : "cs-msg--user");
      div.textContent = msg.text;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Send message
  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";

    await addDoc(msgRef, {
      text,
      role: "user",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "conversations", userId), {
      name: userName,
      lastMessage: text,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}
