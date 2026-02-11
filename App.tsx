
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CourseView from './components/CourseView';
import CoursesPage from './components/CoursesPage';
import ProgressPage from './components/ProgressPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import AIChat from './components/AIChat';
import AITutor from './components/AITutor';
import GamesPage from './components/GamesPage';
import StatusPage from './components/StatusPage';
import ParentDashboard from './components/ParentDashboard';
import MindMapPage from './components/MindMapPage';
import FlashCardsPage from './components/FlashCardsPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfileSetupPage from './components/ProfileSetupPage';
import { NavItem, Course } from './types';
import { initializeGemini } from './services/geminiService';
import { LanguageProvider } from './contexts/LanguageContext';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserProfile, UserProfile } from './services/userProfileService';

type AuthView = 'landing' | 'login' | 'signup' | 'profile-setup' | 'app';

const DEV_PROFILE: UserProfile = {
  uid: 'dev-user-001',
  name: 'Developer مطور',
  email: 'dev@manhaji.ai',
  role: 'student',
  grade: 'الصف الأول الإعدادي',
  stage: 'Grade 7',
};

const AppContent: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [activeNav, setActiveNav] = useState<NavItem>(NavItem.Dashboard);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Initialize Gemini with API key from environment (only once)
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
      initializeGemini(apiKey);
    } else {
      console.warn('⚠️ No Gemini API key found in environment variables');
    }

    // Auth Subscription - runs once on mount
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            const profile = await fetchUserProfile(user.uid);
            if (profile) {
                setCurrentUserProfile(profile);
                // Only auto-navigate if we're on initial screens
                setAuthView(prev => {
                  if (prev === 'landing' || prev === 'login') {
                    return 'app';
                  }
                  return prev;
                });
            } else {
                // User logged in but no profile - create minimal profile
                setCurrentUserProfile({ uid: user.uid, email: user.email || '', role: 'student' });
            }
        } else {
            // User is signed out
            setCurrentUserProfile(null);
            setAuthView(prev => prev === 'app' ? 'landing' : prev);
        }
        setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array - run only once on mount

  const handleNavChange = (item: NavItem) => {
    setActiveNav(item);
    if (item !== NavItem.Courses) {
      setSelectedCourse(null);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setActiveNav(NavItem.Courses);
  };

  const handleLogoClick = () => {
    // If logged in, go to dashboard, else landing
    if (currentUserProfile) {
        setActiveNav(NavItem.Dashboard);
        setSelectedCourse(null);
    } else {
        setAuthView('landing');
    }
  };

  // Auth Flow Handlers
  const handleDevAccess = () => {
      setCurrentUserProfile(DEV_PROFILE);
      setAuthView('app');
  };
  const handleStart = () => setAuthView('login');
  const handleLogin = () => setAuthView('app');
  const handleGoToSignup = () => setAuthView('signup');
  const handleGoToLogin = () => setAuthView('login');
  const handleSignupSuccess = () => setAuthView('profile-setup');
  
  const handleProfileComplete = async () => {
      if (auth.currentUser) {
          const profile = await fetchUserProfile(auth.currentUser.uid);
          setCurrentUserProfile(profile);
      }
      setAuthView('app');
  };

  // While checking auth state on load
  if (loadingAuth && authView === 'app') {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (authView === 'landing') {
    return <LandingPage onStart={handleStart} onDevAccess={handleDevAccess} />;
  }

  if (authView === 'login') {
    return <LoginPage onLogin={handleLogin} onGoToSignup={handleGoToSignup} />;
  }

  if (authView === 'signup') {
    return <SignupPage onSignupSuccess={handleSignupSuccess} onGoToLogin={handleGoToLogin} />;
  }

  if (authView === 'profile-setup') {
    return <ProfileSetupPage onComplete={handleProfileComplete} />;
  }

  const renderContent = () => {
    switch (activeNav) {
      case NavItem.AI:
        return <AITutor />;
      case NavItem.MindMap:
        return <MindMapPage />;
      case NavItem.FlashCards:
        return <FlashCardsPage />;
      case NavItem.Games:
        return <GamesPage />;
      case NavItem.Status:
        return <StatusPage />;
      case NavItem.Parents:
        return <ParentDashboard currentUserProfile={currentUserProfile || DEV_PROFILE} />;
      case NavItem.Courses:
        if (selectedCourse) {
          return <CourseView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
        }
        return <CoursesPage onSelectCourse={handleCourseSelect} />;
      case NavItem.Progress:
        return <ProgressPage />;
      case NavItem.Profile:
        return <ProfilePage />;
      case NavItem.Settings:
        return <SettingsPage />;
      case NavItem.Dashboard:
      default:
        return <Dashboard onSelectCourse={handleCourseSelect} currentUserProfile={currentUserProfile || DEV_PROFILE} />;
    }
  };

  return (
    <Layout activeNav={activeNav} onNavigate={handleNavChange} onLogoClick={handleLogoClick} currentUserProfile={currentUserProfile}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
