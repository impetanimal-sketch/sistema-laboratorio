import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // 👈 FALTAVA ISSO

const firebaseConfig = {
  apiKey: "AIzaSyC4aX32zOl04SSWDv6hl_zJy7VpMkXCtjo",
  authDomain: "sistema-laboratorio-vet.firebaseapp.com",
  projectId: "sistema-laboratorio-vet",
  storageBucket: "sistema-laboratorio-vet.appspot.com",
  messagingSenderId: "913558014260",
  appId: "1:913558014260:web:994215bbd2f4a10743d61"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // 👈 ESSA LINHA RESOLVE TUDO