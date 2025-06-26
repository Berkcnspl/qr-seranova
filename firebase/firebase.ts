// firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo_GNZaP9tjb6bgvvN4OkKxyxKlH96Q40",
  authDomain: "seranova-batch-tracker.firebaseapp.com",
  projectId: "seranova-batch-tracker",
  storageBucket: "seranova-batch-tracker.firebasestorage.app",
  messagingSenderId: "925728186057",
  appId: "1:925728186057:web:00ee97188f30b39c58b718"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını dışa aktar
export const db = getFirestore(app);
