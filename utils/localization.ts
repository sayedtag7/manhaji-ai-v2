import { Badge, Course, Lesson, Language, Unit } from '../types';

export const getCourseTitle = (course: Course, language: Language) =>
  language === 'ar' ? course.titleAr : course.titleEn;

export const getCourseSubject = (course: Course, language: Language) =>
  language === 'ar' ? course.subjectAr : course.subjectEn;

export const getUnitTitle = (unit: Unit, language: Language) =>
  language === 'ar' ? unit.titleAr : unit.titleEn;

export const getLessonTitle = (lesson: Lesson, language: Language) =>
  language === 'ar' ? lesson.titleAr : lesson.titleEn;

export const getLessonDuration = (lesson: Lesson, language: Language) =>
  language === 'ar' ? lesson.durationAr : lesson.durationEn;

export const getLessonContent = (lesson: Lesson, language: Language) =>
  language === 'ar' ? lesson.contentAr : lesson.contentEn;

export const getBadgeName = (badge: Badge, language: Language) =>
  language === 'ar' ? badge.nameAr : badge.nameEn;

export const getBadgeDescription = (badge: Badge, language: Language) =>
  language === 'ar' ? badge.descriptionAr : badge.descriptionEn;
