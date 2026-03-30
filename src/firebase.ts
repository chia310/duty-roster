import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCo8ljP5YTivG5jkudEl9DhqU3964qrtfA",
  authDomain: "duty-roster-oaedu.firebaseapp.com",
  projectId: "duty-roster-oaedu",
  storageBucket: "duty-roster-oaedu.firebasestorage.app",
  messagingSenderId: "877585894355",
  appId: "1:877585894355:web:a3d839b04b922de8753d26",
  measurementId: "G-FT6R03T58V"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
