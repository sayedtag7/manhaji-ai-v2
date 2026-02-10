# Firebase Authentication Setup Guide

## Overview

This project now includes Google Authentication using Firebase. Follow these steps to configure it properly.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "Manhaji")
4. Follow the setup wizard

## Step 2: Enable Google Authentication

1. In your Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Enable it and provide:
   - Project support email
   - Click "Save"

## Step 3: Register Your Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Manhaji Web")
5. Copy the `firebaseConfig` object

## Step 4: Update Firebase Configuration

1. Open `config/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

## Step 6: Test the Authentication

1. Run your development server: `npm run dev`
2. Navigate to the login or signup page
3. Click the Google button
4. You should see a Google sign-in popup

## Features Implemented

### Login Page

- ✅ Email/Password authentication
- ✅ Google Sign-In button
- ✅ Error handling with Arabic messages
- ✅ Loading states

### Signup Page

- ✅ Email/Password registration
- ✅ Google Sign-Up button
- ✅ Password confirmation validation
- ✅ Role selection (Student/Teacher/Parent)
- ✅ Error handling with Arabic messages

### Authentication Service

- `signInWithGoogle()` - Google popup authentication
- `signUpWithEmail(email, password)` - Email/password registration
- `signInWithEmail(email, password)` - Email/password login
- `logOut()` - Sign out current user
- `getCurrentUser()` - Get current authenticated user
- `getAuthErrorMessage(errorCode)` - Get localized error messages

## Troubleshooting

### "Popup closed by user" error

This is normal when users close the Google popup. The app handles this gracefully.

### "auth/unauthorized-domain"

Make sure your domain is added to the authorized domains list in Firebase Console.

### "auth/api-key-not-valid"

Check that you've correctly copied your Firebase config values.

## Security Notes

⚠️ **Important**: Never commit your actual Firebase configuration to a public repository. Consider using environment variables for production:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

Then create a `.env` file (add to `.gitignore`):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... other variables
```

## Next Steps

To extend authentication functionality:

- Add password reset flow
- Implement email verification
- Add additional providers (Facebook, Apple, etc.)
- Set up user profiles in Firestore
- Implement protected routes based on authentication state
