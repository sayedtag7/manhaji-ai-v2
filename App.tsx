
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CourseView from './components/CourseView';
import CoursesPage from './components/CoursesPage';
import ProgressPage from './components/ProgressPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import AIChat from './components/AIChat';
import ParentDashboard from './components/ParentDashboard';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfileSetupPage from './components/ProfileSetupPage';
import { NavItem, Course } from './types';
import { initializeGemini } from './services/geminiService';
import { LanguageProvider } from './contexts/LanguageContext';

type AuthView = 'landing' | 'login' | 'signup' | 'profile-setup' | 'app';

const DEV_PROFILE = {
  uid: 'dev-user-001',
  name: 'Developer مطور',
  email: 'dev@manhaji.ai',
  role: 'student' as const,
  grade: 'الصف الأول الإعدادي',
  stage: 'Grade 7',
};

const AppContent: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [activeNav, setActiveNav] = useState<NavItem>(NavItem.Dashboard);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      initializeGemini(apiKey);
    } else {
      console.warn('No Gemini API key found in env');
    }
  }, []);

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
    setAuthView('landing');
    setActiveNav(NavItem.Dashboard);
    setSelectedCourse(null);
  };

  // Auth Flow Handlers
  const handleDevAccess = () => setAuthView('app');
  const handleStart = () => setAuthView('login');
  const handleLogin = () => setAuthView('app');
  const handleGoToSignup = () => setAuthView('signup');
  const handleGoToLogin = () => setAuthView('login');
  const handleSignupSuccess = () => setAuthView('profile-setup');
  const handleProfileComplete = () => setAuthView('app');

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
        return (
          <div className="h-[calc(100vh-140px)]">
            <AIChat />
          </div>
        );
      case NavItem.Parents:
        return <ParentDashboard currentUserProfile={DEV_PROFILE} />;
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
        return <Dashboard onSelectCourse={handleCourseSelect} currentUserProfile={DEV_PROFILE} />;
    }
  };

  return (
    <Layout activeNav={activeNav} onNavigate={handleNavChange} onLogoClick={handleLogoClick}>
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
