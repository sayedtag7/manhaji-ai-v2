
import React from 'react';
import { MOCK_USER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { getBadgeDescription, getBadgeName } from '../utils/localization';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface GamificationProps {
    studentId?: string;
}

const Gamification: React.FC<GamificationProps> = ({ studentId }) => {
    const { t, language } = useLanguage();

    // Generate heatmap grid (mock)
    const renderHeatmap = () => {
        return (
            <div className="grid grid-cols-7 gap-1 mt-4">
                {MOCK_USER.activityData.map((level, i) => (
                    <div 
                        key={i} 
                        className={`w-full aspect-square rounded-sm ${
                            level === 0 ? 'bg-gray-100' : 
                            level < 3 ? 'bg-brand-200' : 
                            level < 6 ? 'bg-brand-400' : 'bg-brand-600'
                        }`}
                        title={`${level} activities`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {t('gamification')}
                    </h3>
                    <span className="text-brand-600 font-bold bg-brand-50 px-3 py-1 rounded-full text-sm">
                        {MOCK_USER.points} XP
                    </span>
                </div>
                
                <h4 className="text-sm font-bold text-gray-600 mb-3">{t('badges')}</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {MOCK_USER.badges.map(badge => (
                        <div key={badge.id} className="min-w-[100px] flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <p className="text-xs font-bold text-center text-gray-800">{getBadgeName(badge, language)}</p>
                            <p className="text-[10px] text-gray-500 text-center mt-1">{getBadgeDescription(badge, language)}</p>
                        </div>
                    ))}
                    <div className="min-w-[100px] flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 opacity-50 justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mb-2"></div>
                        <p className="text-xs text-gray-400">{t('comingSoon')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                    <h3 className="font-bold text-lg">{t('activityHeatmap')}</h3>
                </div>
                {renderHeatmap()}
                <div className="flex justify-end items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{t('less')}</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                        <div className="w-3 h-3 bg-brand-200 rounded-sm"></div>
                        <div className="w-3 h-3 bg-brand-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-brand-600 rounded-sm"></div>
                    </div>
                    <span>{t('more')}</span>
                </div>
            </div>
        </div>
    );
};

export default Gamification;
