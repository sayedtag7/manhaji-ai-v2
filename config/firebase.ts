import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASTg_KeihL0sa6MrNlfnHbgu1Da31zhP4",
  authDomain: "manhaji1.firebaseapp.com",
  projectId: "manhaji1",
  storageBucket: "manhaji1.firebasestorage.app",
  messagingSenderId: "984225650494",
  appId: "1:984225650494:web:3a199b3227aba067edbe6f",
  measurementId: "G-PMVZZ304J2"
};

// Initialize Firebase (prevent multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

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
