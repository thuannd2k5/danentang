import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Cấu hình Firebase thống nhất cho cả Web và Mobile
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDZt6b4aZqj2qBy-S-hmw6pTZyjdrO5iJ4",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "danentang-fd9df.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "danentang-fd9df",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "danentang-fd9df.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1015850605107",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1015850605107:web:8aa342df477cf6bc3f6146",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-G1EBV3W68C",
};

// Khởi tạo app (tránh khởi tạo trùng lặp khi hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };
