import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5IDooXLWR6ULrlx0M_U2Ner1GtvqKUrg",
  authDomain: "manhaji-a8dcb.firebaseapp.com",
  projectId: "manhaji-a8dcb",
  storageBucket: "manhaji-a8dcb.firebasestorage.app",
  messagingSenderId: "13054125609",
  appId: "1:13054125609:web:043bfd0184d9ad059a1e38",
  measurementId: "G-YH56796LN9"
};

// Initialize Firebase (prevent multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment and if supported)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(err => {
    console.log('Analytics not supported:', err);
  });
}

export { analytics };
export default app;
