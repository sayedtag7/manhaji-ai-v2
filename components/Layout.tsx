
import React, { useState } from 'react';
import { NavItem } from '../types';
import { MOCK_USER } from '../constants';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  LogOut,
  Bell,
  Menu,
  Bot,
  Globe,
  Users,
  School,
  Settings,
  User,
  Gamepad2,
  TrendingUp,
  Brain,
  Layers
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../services/userProfileService';

interface LayoutProps {
  children: React.ReactNode;
  activeNav: NavItem;
  onNavigate: (item: NavItem) => void;
  onLogoClick?: () => void;
  currentUserProfile?: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeNav, onNavigate, onLogoClick, currentUserProfile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const userName = currentUserProfile?.name || MOCK_USER.name;
  const userLevel = MOCK_USER.level; // TODO: derive from profile
  const userTier = MOCK_USER.subscriptionTier;

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const logoSrc = language === 'ar' ? '/logo_ar.png' : '/logo_en.png';

  const NavButton = ({ item, icon: Icon, label }: { item: NavItem; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(item);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-6 py-4 transition-colors duration-200 ${activeNav === item
          ? 'text-brand-600 bg-brand-50 border-e-4 border-brand-500 font-bold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-brand-500'
        }`}
    >
      <Icon className="w-5 h-5 ms-3 rtl:ml-3 ltr:mr-3" />
      <span className="text-lg">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans transition-all duration-300">

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="text-gray-600" />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 start-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none border-e border-gray-100 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full md:translate-x-0')}
      `}>
        <div
          className="py-4 px-6 flex items-center justify-center border-b border-gray-50 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onLogoClick}
        >
          <img src={logoSrc} alt={`${t('appTitle')} logo`} className="w-[160px] h-auto object-contain" />
        </div>

        <div className="mt-6 flex flex-col gap-1 overflow-y-auto flex-1">
          <NavButton item={NavItem.Dashboard} icon={LayoutDashboard} label={t('dashboard')} />
          <NavButton item={NavItem.Courses} icon={BookOpen} label={t('courses')} />
          <NavButton item={NavItem.Progress} icon={Trophy} label={t('progress')} />
          <NavButton item={NavItem.AI} icon={Bot} label={t('aiTutor')} />
          <NavButton item={NavItem.MindMap} icon={Brain} label={language === 'ar' ? 'الخرائط الذهنية' : 'Mind Maps'} />
          <NavButton item={NavItem.FlashCards} icon={Layers} label={language === 'ar' ? 'البطاقات' : 'Flash Cards'} />
          <NavButton item={NavItem.Games} icon={Gamepad2} label={language === 'ar' ? 'الألعاب' : 'Games'} />
          <NavButton item={NavItem.Status} icon={TrendingUp} label={language === 'ar' ? 'الحالة' : 'Status'} />

          <div className="my-2 border-t border-gray-100 mx-6"></div>
          <span className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 block">Admin & Family</span>

          <NavButton item={NavItem.Parents} icon={Users} label={t('parentsArea')} />
          <button className="flex items-center w-full px-6 py-4 text-gray-400 hover:text-brand-500 cursor-not-allowed opacity-60">
            <School className="w-5 h-5 ms-3 rtl:ml-3 ltr:mr-3" />
            <span className="text-lg">School Portal</span>
          </button>

          <div className="my-2 border-t border-gray-100 mx-6"></div>
          <span className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 block">Account</span>

          <NavButton item={NavItem.Profile} icon={User} label={t('profile')} />
          <NavButton item={NavItem.Settings} icon={Settings} label={t('settings')} />
        </div>

        <div className="p-6 border-t border-gray-50 shrink-0">
          <button className="flex items-center text-gray-400 hover:text-red-500 transition-colors px-6">
            <LogOut className="w-5 h-5 ms-3 rtl:ml-3 ltr:mr-3" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white px-8 py-5 flex justify-between items-center border-b border-gray-100 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-700 hidden md:block">
              {activeNav === NavItem.Dashboard && t('dashboard')}
              {activeNav === NavItem.Courses && t('courses')}
              {activeNav === NavItem.Progress && t('progress')}
              {activeNav === NavItem.AI && t('aiTutor')}
              {activeNav === NavItem.MindMap && (language === 'ar' ? 'الخرائط الذهنية' : 'Mind Maps')}
              {activeNav === NavItem.FlashCards && (language === 'ar' ? 'البطاقات التعليمية' : 'Flash Cards')}
              {activeNav === NavItem.Games && (language === 'ar' ? 'الألعاب' : 'Games')}
              {activeNav === NavItem.Parents && t('parentsArea')}
              {activeNav === NavItem.Profile && t('profile')}
              {activeNav === NavItem.Settings && t('settings')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-bold">
                {language === 'ar' ? t('languageEnglish') : t('languageArabic')}
              </span>
            </button>

            <button className="relative p-2 text-gray-400 hover:text-brand-500 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div
              className="flex items-center gap-3 ps-6 border-s border-gray-100 cursor-pointer"
              onClick={() => onNavigate(NavItem.Profile)}
            >
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-gray-800">{userName}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-500">{userLevel}</p>
                  {userTier === 'free' && (
                    <span className="text-[10px] bg-brand-100 text-brand-600 px-1.5 rounded font-bold">Free</span>
                  )}
                </div>
              </div>
              <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-white font-extrabold text-lg">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
