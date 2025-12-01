
import React from 'react';
import { Course } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getCourseSubject, getCourseTitle } from '../utils/localization';
import Sparkline from './Sparkline';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    onClick: () => void;
    variant?: 'full' | 'compact';
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, variant = 'full' }) => {
    const { t, language } = useLanguage();
    const title = getCourseTitle(course, language);
    const subject = getCourseSubject(course, language);

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
        >
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img src={course.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {course.progress === 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t('statusNew')}</span>
                    )}
                    {course.progress > 0 && course.progress < 100 && (
                        <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t('statusInProgress')}</span>
                    )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 p-3 rounded-full text-brand-600 shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                        <PlayCircle className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{title}</h3>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded flex items-center gap-1">
                        4.9 ★
                    </span>
                </div>

                <p className="text-sm text-gray-500 mb-4">{subject}</p>

                {variant === 'full' && (
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
                            <BookOpen className="w-3 h-3 text-brand-500" />
                            <span>{course.units.reduce((acc, u) => acc + u.lessons.length, 0)} {t('totalLessons')}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
                            <Clock className="w-3 h-3 text-brand-500" />
                            <span>6 {t('hours')}</span>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500">
                            {course.progress}% {t('completed')}
                        </span>
                        {course.weeklyProgress && (
                            <div className="w-16 h-6 opacity-50">
                                <Sparkline data={course.weeklyProgress} color="#20c997" height={20} />
                            </div>
                        )}
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
