
import React from 'react';
import { MOCK_USER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Mail, Book, Lock, Camera, Save } from 'lucide-react';
import Gamification from './Gamification';

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* Profile Settings */}
      <div className="flex-1 space-y-8">
        <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">الملف الشخصي</h1>
            <p className="text-gray-600">إدارة معلومات حسابك الشخصية والأكاديمية.</p>
        </div>

        {/* Header Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-500 to-brand-400 opacity-10"></div>
            
            <div className="relative group">
                <div className="w-28 h-28 bg-brand-100 rounded-full flex items-center justify-center text-3xl font-bold text-brand-600 border-4 border-white shadow-xl">
                    AM
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-brand-600 transition-colors shadow-lg border-2 border-white">
                    <Camera className="w-4 h-4" />
                </button>
            </div>
            
            <div className="text-center md:text-right z-10 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{MOCK_USER.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{MOCK_USER.level}</span>
                    <span>•</span>
                    <span className="text-sm">الطالب</span>
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                     <div className="text-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                         <span className="block font-bold text-brand-600 text-lg">{MOCK_USER.points}</span>
                         <span className="text-xs text-gray-400 font-bold uppercase">XP Point</span>
                     </div>
                     <div className="text-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                         <span className="block font-bold text-gray-800 text-lg">{MOCK_USER.completedSessions}</span>
                         <span className="text-xs text-gray-400 font-bold uppercase">Lesson</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                البيانات الأساسية
            </h3>
            
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                defaultValue={MOCK_USER.name}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                defaultValue="ahmed@example.com"
                                disabled
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">المرحلة الدراسية</label>
                        <div className="relative">
                            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white focus:outline-none transition-colors appearance-none">
                                <option>المرحلة الإعدادية</option>
                                <option>المرحلة الثانوية</option>
                            </select>
                            <Book className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">الصف الدراسي</label>
                        <div className="relative">
                            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white focus:outline-none transition-colors appearance-none">
                                <option>الصف الأول الإعدادي</option>
                                <option>الصف الثاني الإعدادي</option>
                                <option>الصف الثالث الإعدادي</option>
                            </select>
                            <Book className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" />
                        الأمان
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">كلمة المرور الحالية</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">كلمة المرور الجديدة</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="button" className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200 flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        حفظ التغييرات
                    </button>
                </div>
            </form>
        </div>

      </div>

      {/* Sidebar Gamification Stats */}
      <div className="w-full lg:w-80">
         <Gamification />
      </div>

    </div>
  );
};

export default ProfilePage;
