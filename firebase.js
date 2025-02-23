import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyB6Um_zSlHKQ9JuAEC5U2K3Bx4BCzLbbHc",
  authDomain: "team5init.firebaseapp.com",
  projectId: "team5init",
  storageBucket: "team5init.firebasestorage.app",
  messagingSenderId: "121552966763",
  appId: "1:121552966763:web:924eb937415da173b04d2e",
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
export default db;
