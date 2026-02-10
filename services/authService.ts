import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Initialize Google Provider with proper configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  display: 'popup'
});

// Add scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error);
});

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    console.log('Attempting Google Sign-In...');
    console.log('Auth state:', auth);
    console.log('Provider:', googleProvider);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Google Sign-In Error Details:', {
      code: error.code,
      message: error.message,
      customData: error.customData,
      fullError: error
    });
    
    // Add more specific error details
    if (error.code === 'auth/configuration-not-found') {
      console.error('Firebase Auth Configuration Error. Check:');
      console.error('1. Is Google Sign-In enabled in Firebase Console?');
      console.error('2. Is the API key correct?');
      console.error('3. Go to: https://console.firebase.google.com/project/manhaji1/authentication/providers');
    }
    
    throw error;
  }
};

// Sign up with Email and Password
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error: any) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// Sign in with Email and Password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error: any) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Error message handler
export const getAuthErrorMessage = (errorCode: string): string => {
  console.log('Error code received:', errorCode);
  
  switch (errorCode) {
    case 'auth/configuration-not-found':
      return 'خطأ في إعدادات Firebase. يرجى تفعيل Google Sign-In من لوحة Firebase';
    case 'auth/email-already-in-use':
      return 'البريد الإلكتروني مستخدم بالفعل';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صحيح';
    case 'auth/user-not-found':
      return 'المستخدم غير موجود';
    case 'auth/wrong-password':
      return 'كلمة المرور خاطئة';
    case 'auth/invalid-credential':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    case 'auth/popup-closed-by-user':
      return 'تم إلغاء عملية تسجيل الدخول';
    case 'auth/cancelled-popup-request':
      return 'تم إلغاء الطلب';
    case 'auth/network-request-failed':
      return 'خطأ في الاتصال بالشبكة';
    case 'auth/unauthorized-domain':
      return 'النطاق غير مصرح به. تحقق من إعدادات Firebase';
    case 'auth/operation-not-allowed':
      return 'طريقة تسجيل الدخول غير مفعلة في Firebase Console';
    case 'auth/too-many-requests':
      return 'محاولات كثيرة. حاول مرة أخرى لاحقاً';
    default:
      return `حدث خطأ. حاول مرة أخرى (${errorCode || 'unknown'})`;
  }
};
