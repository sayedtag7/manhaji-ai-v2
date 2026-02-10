import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  role?: 'student' | 'parent' | 'teacher';
  grade?: string; // e.g. "Grade 7" or "الصف الأول الإعدادي"
  stage?: string; // e.g. "Middle School"
  school?: string;
  avatar_url?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  preferred_language?: string;
  created_at?: string;
}

// Cache the profile in memory for the session
let cachedProfile: UserProfile | null = null;

export function setCachedProfile(profile: UserProfile | null) {
  cachedProfile = profile;
}

export function getCachedProfile(): UserProfile | null {
  return cachedProfile;
}

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      setCachedProfile(profile);
      return profile;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      created_at: new Date().toISOString()
    });
    setCachedProfile(profile);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, updates);
        
        // Update cache if it exists
        if (cachedProfile && cachedProfile.uid === uid) {
            cachedProfile = { ...cachedProfile, ...updates };
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

