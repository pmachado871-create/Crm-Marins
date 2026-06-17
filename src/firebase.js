// firebase.js
// Configuração e inicialização do Firebase para o CRM Pré-Campanha Marins 2026

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCL3NyP1mdALjkFgzjP-pLGBgwH7-lujEw",
  authDomain: "crm-marins-26.firebaseapp.com",
  projectId: "crm-marins-26",
  storageBucket: "crm-marins-26.firebasestorage.app",
  messagingSenderId: "1006713729909",
  appId: "1:1006713729909:web:6ff9e387f0411a7c7cd93c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
