// User Profile Service — abstracts Supabase user profile operations

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  role?: 'student' | 'parent' | 'teacher';
  grade?: string;
  stage?: string;
  avatar_url?: string;
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
