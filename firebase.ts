import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web config is public (it ships in the client bundle). These values
// come from the Falcon Overseas Firebase project where Google sign-in is enabled
// for the authorised accounts. VITE_FIREBASE_* env vars override them if set.
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBObSNwYDtO17NEnghm_yVCMk-11w1-neA',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'fluent-limiter-491005-s3.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'fluent-limiter-491005-s3',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'fluent-limiter-491005-s3.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '985892586274',
  appId: env.VITE_FIREBASE_APP_ID || '1:985892586274:web:2e3b3efb38ff9c1163db7b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
