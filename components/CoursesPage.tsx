
import React, { useState } from 'react';
import { Course } from '../types';
import { COURSES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { getCourseTitle } from '../utils/localization';
import CourseCard from './CourseCard';
import { Search, Filter, Sparkles } from 'lucide-react';

interface CoursesPageProps {
    onSelectCourse: (course: Course) => void;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ onSelectCourse }) => {
    const { language, t } = useLanguage();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredCourses = COURSES.filter(course => {
        const courseTitle = getCourseTitle(course, language);
        const matchesSearch = courseTitle.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'in-progress'
                ? course.progress > 0 && course.progress < 100
                : filter === 'completed'
                    ? course.progress === 100
                    : course.progress === 0; // new

        return matchesSearch && matchesFilter;
    });

    const recommendedCourse = COURSES[0]; // Mock recommendation
    const localizedCopy = language === 'ar'
        ? {
            pageSubtitle: 'اكتشف دوراتك، وتابع تقدمك التعليمي.',
            searchPlaceholder: 'ابحث عن دورة...',
            filterAll: 'الكل',
            filterInProgress: 'قيد الدراسة',
            filterNew: 'جديد',
            filterActionLabel: 'تصفية',
            recommendedBadge: 'مختار لك بعناية',
            recommendedDesc: `هذه الدورة تناسب مستواك الحالي وستساعدك على تحسين نقاط ضعفك في ${recommendedCourse.subject}.`,
            recommendedStart: 'ابدأ الآن',
            recommendedDetails: 'التفاصيل',
            noResults: 'لا توجد دورات مطابقة للبحث.'
        }
        : {
            pageSubtitle: 'Discover your courses and track your learning progress.',
            searchPlaceholder: 'Search for a course...',
            filterAll: 'All',
            filterInProgress: 'In progress',
            filterNew: 'New',
            filterActionLabel: 'Filter',
            recommendedBadge: 'Handpicked for you',
            recommendedDesc: `This course matches your current level and helps you strengthen your ${recommendedCourse.subject} skills.`,
            recommendedStart: 'Start now',
            recommendedDetails: 'Details',
            noResults: 'No courses match your search yet.'
        };

    const getSectionHeading = () => {
        if (search) return language === 'ar' ? 'نتائج البحث' : 'Search results';
        if (filter === 'in-progress') return language === 'ar' ? 'قيد الدراسة' : 'In progress';
        if (filter === 'new') return language === 'ar' ? 'دورات جديدة' : 'New courses';
        return language === 'ar' ? 'جميع الدورات' : 'All courses';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10">

            {/* Header & Filters */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{t('courses')}</h1>
                    <p className="text-gray-600">{localizedCopy.pageSubtitle}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={localizedCopy.searchPlaceholder}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {localizedCopy.filterAll}
                        </button>
                        <button
                            onClick={() => setFilter('in-progress')}
                            className={`px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'in-progress' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {localizedCopy.filterInProgress}
                        </button>
                        <button
                            onClick={() => setFilter('new')}
                            className={`px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'new' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {localizedCopy.filterNew}
                        </button>
                        <button
                            className="px-4 py-3 rounded-xl font-bold whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" /> {localizedCopy.filterActionLabel}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recommended Section (Only show if no search) */}
            {!search && filter === 'all' && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-900">{t('recommended')}</h2>
                    </div>
                    <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-1 shadow-xl">
                        <div className="bg-white rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 space-y-4">
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">{localizedCopy.recommendedBadge}</span>
                                <h3 className="text-3xl font-black text-gray-900">{getCourseTitle(recommendedCourse, language)}</h3>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {localizedCopy.recommendedDesc}
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <button onClick={() => onSelectCourse(recommendedCourse)} className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200">
                                        {localizedCopy.recommendedStart}
                                    </button>
                                    <button className="px-8 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                        {localizedCopy.recommendedDetails}
                                    </button>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shadow-lg rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img src={recommendedCourse.image} className="w-full h-full object-cover" alt="Recommended" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Course Grid */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {getSectionHeading()}
                </h2>

                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <CourseCard key={course.id} course={course} onClick={() => onSelectCourse(course)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">{localizedCopy.noResults}</p>
                    </div>
                )}
            </section>

        </div>
    );
};

export default CoursesPage;
