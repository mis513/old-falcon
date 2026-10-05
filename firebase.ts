import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web config is public (it ships in the client bundle), so it is kept
// here directly — no environment variables needed. This is the Falcon Overseas
// Firebase project, where Google sign-in is enabled for the authorised accounts.
const firebaseConfig = {
  apiKey: 'AIzaSyBObSNwYDtO17NEnghm_yVCMk-11w1-neA',
  authDomain: 'fluent-limiter-491005-s3.firebaseapp.com',
  projectId: 'fluent-limiter-491005-s3',
  storageBucket: 'fluent-limiter-491005-s3.firebasestorage.app',
  messagingSenderId: '985892586274',
  appId: '1:985892586274:web:2e3b3efb38ff9c1163db7b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
