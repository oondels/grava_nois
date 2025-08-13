// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence, // ou browserSessionPersistence / inMemoryPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: `${import.meta.env.VITE_FB_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  storageBucket: `${import.meta.env.VITE_FB_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  measurementId: `G-${import.meta.env.VITE_FB_MEASUREMENT_ID}`,
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "pt-BR"; // Define o idioma do Firebase Auth

// Persistência: usuário continua logado ao reabrir o app.
await setPersistence(auth, browserLocalPersistence);
