/**
 * Curriculum Configuration
 * MOETE National Curriculum Structure (Grades 7-10)
 * 
 * This file defines the complete curriculum taxonomy that grounds all AI responses.
 * Each lesson is tagged to Grade, Subject, Unit, and Learning Objective per MOETE standards.
 */

export interface LearningObjective {
  id: string;
  moeteReference: string; // Official MOETE chapter/section ID
  description: string;
  cognitiveLevel: 'Understanding' | 'Application' | 'Reasoning';
  examPriority: number; // 0.0 to 1.0 (weight in national exams)
}

export interface Lesson {
  lessonId: string;
  unitId: string;
  title: string;
  titleAr: string; // Arabic translation
  learningObjectives: LearningObjective[];
  prerequisites: string[]; // Lesson IDs that must be mastered first
  estimatedMinutes: number;
  topicTags: string[]; // For search and linking
}

export interface Unit {
  unitId: string;
  curriculumId: string;
  name: string;
  nameAr: string;
  moeteReference: string;
  lessons: Lesson[];
}

export interface Curriculum {
  curriculumId: string;
  name: string;
  grade: 7 | 8 | 9 | 10;
  subject: 'Mathematics' | 'Physics' | 'Chemistry';
  language: 'ar' | 'en';
  authority: 'MOETE';
  academicYear: string; // e.g., "2024-2025"
  units: Unit[];
}

/**
 * MOETE GRADE 7-10 CURRICULUM STRUCTURE
 * 
 * This is a starter template. Full curriculum must be populated with:
 * 1. Official MOETE textbook content
 * 2. Learning objectives from Ministry documents
 * 3. Exam question patterns and priorities
 */

export const CURRICULUM_DATABASE: Curriculum[] = [
  // ===================================
  // GRADE 7 - MATHEMATICS
  // ===================================
  {
    curriculumId: 'moete-grade7-math-2024',
    name: 'Grade 7 Mathematics',
    grade: 7,
    subject: 'Mathematics',
    language: 'en',
    authority: 'MOETE',
    academicYear: '2024-2025',
    units: [
      {
        unitId: 'g7-math-u1',
        curriculumId: 'moete-grade7-math-2024',
        name: 'Unit 1: Integers and Rational Numbers',
        nameAr: 'الوحدة الأولى: الأعداد الصحيحة والنسبية',
        moeteReference: 'G7-M-U1',
        lessons: [
          {
            lessonId: 'g7-math-u1-l1',
            unitId: 'g7-math-u1',
            title: 'Introduction to Integers',
            titleAr: 'مقدمة إلى الأعداد الصحيحة',
            learningObjectives: [
              {
                id: 'g7-m-u1-l1-obj1',
                moeteReference: 'G7-M-1.1.1',
                description: 'Define integers and identify them on number line',
                cognitiveLevel: 'Understanding',
                examPriority: 0.6,
              },
              {
                id: 'g7-m-u1-l1-obj2',
                moeteReference: 'G7-M-1.1.2',
                description: 'Compare and order integers',
                cognitiveLevel: 'Application',
                examPriority: 0.7,
              },
            ],
            prerequisites: [],
            estimatedMinutes: 45,
            topicTags: ['integers', 'number-line', 'ordering'],
          },
          {
            lessonId: 'g7-math-u1-l2',
            unitId: 'g7-math-u1',
            title: 'Operations with Integers',
            titleAr: 'العمليات على الأعداد الصحيحة',
            learningObjectives: [
              {
                id: 'g7-m-u1-l2-obj1',
                moeteReference: 'G7-M-1.2.1',
                description: 'Add and subtract integers using rules',
                cognitiveLevel: 'Application',
                examPriority: 0.9,
              },
              {
                id: 'g7-m-u1-l2-obj2',
                moeteReference: 'G7-M-1.2.2',
                description: 'Multiply and divide integers',
                cognitiveLevel: 'Application',
                examPriority: 0.8,
              },
            ],
            prerequisites: ['g7-math-u1-l1'],
            estimatedMinutes: 60,
            topicTags: ['integers', 'operations', 'addition', 'subtraction', 'multiplication', 'division'],
          },
        ],
      },
      {
        unitId: 'g7-math-u2',
        curriculumId: 'moete-grade7-math-2024',
        name: 'Unit 2: Algebraic Expressions',
        nameAr: 'الوحدة الثانية: التعبيرات الجبرية',
        moeteReference: 'G7-M-U2',
        lessons: [
          {
            lessonId: 'g7-math-u2-l1',
            unitId: 'g7-math-u2',
            title: 'Introduction to Variables and Expressions',
            titleAr: 'مقدمة إلى المتغيرات والتعبيرات',
            learningObjectives: [
              {
                id: 'g7-m-u2-l1-obj1',
                moeteReference: 'G7-M-2.1.1',
                description: 'Identify variables, constants, and coefficients',
                cognitiveLevel: 'Understanding',
                examPriority: 0.7,
              },
              {
                id: 'g7-m-u2-l1-obj2',
                moeteReference: 'G7-M-2.1.2',
                description: 'Evaluate algebraic expressions',
                cognitiveLevel: 'Application',
                examPriority: 0.8,
              },
            ],
            prerequisites: ['g7-math-u1-l2'],
            estimatedMinutes: 50,
            topicTags: ['algebra', 'variables', 'expressions', 'evaluation'],
          },
        ],
      },
    ],
  },

  // ===================================
  // GRADE 8 - MATHEMATICS
  // ===================================
  {
    curriculumId: 'moete-grade8-math-2024',
    name: 'Grade 8 Mathematics',
    grade: 8,
    subject: 'Mathematics',
    language: 'en',
    authority: 'MOETE',
    academicYear: '2024-2025',
    units: [
      {
        unitId: 'g8-math-u1',
        curriculumId: 'moete-grade8-math-2024',
        name: 'Unit 1: Linear Equations',
        nameAr: 'الوحدة الأولى: المعادلات الخطية',
        moeteReference: 'G8-M-U1',
        lessons: [
          {
            lessonId: 'g8-math-u1-l1',
            unitId: 'g8-math-u1',
            title: 'Solving Simple Linear Equations',
            titleAr: 'حل المعادلات الخطية البسيطة',
            learningObjectives: [
              {
                id: 'g8-m-u1-l1-obj1',
                moeteReference: 'G8-M-1.1.1',
                description: 'Solve one-step and two-step equations',
                cognitiveLevel: 'Application',
                examPriority: 0.85,
              },
              {
                id: 'g8-m-u1-l1-obj2',
                moeteReference: 'G8-M-1.1.2',
                description: 'Apply inverse operations correctly',
                cognitiveLevel: 'Application',
                examPriority: 0.9,
              },
            ],
            prerequisites: ['g7-math-u2-l1'],
            estimatedMinutes: 55,
            topicTags: ['linear-equations', 'solving', 'inverse-operations'],
          },
          {
            lessonId: 'g8-math-u1-l2',
            unitId: 'g8-math-u1',
            title: 'Simultaneous Linear Equations',
            titleAr: 'المعادلات الخطية المتزامنة',
            learningObjectives: [
              {
                id: 'g8-m-u1-l2-obj1',
                moeteReference: 'G8-M-1.2.1',
                description: 'Solve simultaneous equations using substitution method',
                cognitiveLevel: 'Application',
                examPriority: 0.95,
              },
              {
                id: 'g8-m-u1-l2-obj2',
                moeteReference: 'G8-M-1.2.2',
                description: 'Solve simultaneous equations using elimination method',
                cognitiveLevel: 'Application',
                examPriority: 0.95,
              },
            ],
            prerequisites: ['g8-math-u1-l1'],
            estimatedMinutes: 70,
            topicTags: ['simultaneous-equations', 'substitution', 'elimination', 'linear-equations'],
          },
        ],
      },
    ],
  },

  // ===================================
  // GRADE 7 - SCIENCE (PHYSICS)
  // ===================================
  {
    curriculumId: 'moete-grade7-physics-2024',
    name: 'Grade 7 Physics',
    grade: 7,
    subject: 'Physics',
    language: 'en',
    authority: 'MOETE',
    academicYear: '2024-2025',
    units: [
      {
        unitId: 'g7-phys-u1',
        curriculumId: 'moete-grade7-physics-2024',
        name: 'Unit 1: Introduction to Matter',
        nameAr: 'الوحدة الأولى: مقدمة إلى المادة',
        moeteReference: 'G7-P-U1',
        lessons: [
          {
            lessonId: 'g7-phys-u1-l1',
            unitId: 'g7-phys-u1',
            title: 'States of Matter',
            titleAr: 'حالات المادة',
            learningObjectives: [
              {
                id: 'g7-p-u1-l1-obj1',
                moeteReference: 'G7-P-1.1.1',
                description: 'Identify the three states of matter',
                cognitiveLevel: 'Understanding',
                examPriority: 0.6,
              },
              {
                id: 'g7-p-u1-l1-obj2',
                moeteReference: 'G7-P-1.1.2',
                description: 'Explain phase transitions',
                cognitiveLevel: 'Understanding',
                examPriority: 0.7,
              },
            ],
            prerequisites: [],
            estimatedMinutes: 40,
            topicTags: ['matter', 'states', 'solid', 'liquid', 'gas', 'phase-transitions'],
          },
        ],
      },
      {
        unitId: 'g7-phys-u2',
        curriculumId: 'moete-grade7-physics-2024',
        name: 'Unit 2: Forces and Motion',
        nameAr: 'الوحدة الثانية: القوى والحركة',
        moeteReference: 'G7-P-U2',
        lessons: [
          {
            lessonId: 'g7-phys-u2-l1',
            unitId: 'g7-phys-u2',
            title: 'Introduction to Motion',
            titleAr: 'مقدمة إلى الحركة',
            learningObjectives: [
              {
                id: 'g7-p-u2-l1-obj1',
                moeteReference: 'G7-P-2.1.1',
                description: 'Define distance, displacement, speed, and velocity',
                cognitiveLevel: 'Understanding',
                examPriority: 0.8,
              },
              {
                id: 'g7-p-u2-l1-obj2',
                moeteReference: 'G7-P-2.1.2',
                description: 'Calculate average speed',
                cognitiveLevel: 'Application',
                examPriority: 0.85,
              },
            ],
            prerequisites: [],
            estimatedMinutes: 50,
            topicTags: ['motion', 'speed', 'velocity', 'distance', 'displacement'],
          },
        ],
      },
    ],
  },
];

/**
 * Helper functions for curriculum queries
 */
export class CurriculumService {
  /**
   * Get curriculum by grade and subject
   */
  static getCurriculum(grade: number, subject: string): Curriculum | undefined {
    return CURRICULUM_DATABASE.find(
      (c) => c.grade === grade && c.subject === subject
    );
  }

  /**
   * Get lesson by ID
   */
  static getLesson(lessonId: string): Lesson | undefined {
    for (const curriculum of CURRICULUM_DATABASE) {
      for (const unit of curriculum.units) {
        const lesson = unit.lessons.find((l) => l.lessonId === lessonId);
        if (lesson) return lesson;
      }
    }
    return undefined;
  }

  /**
   * Get all prerequisites for a lesson (recursive)
   */
  static getAllPrerequisites(lessonId: string): string[] {
    const lesson = this.getLesson(lessonId);
    if (!lesson || !lesson.prerequisites.length) return [];

    const allPrereqs = [...lesson.prerequisites];
    for (const prereqId of lesson.prerequisites) {
      allPrereqs.push(...this.getAllPrerequisites(prereqId));
    }
    return [...new Set(allPrereqs)]; // Remove duplicates
  }

  /**
   * Get high-priority exam topics for a grade/subject
   */
  static getExamPriorityTopics(
    grade: number,
    subject: string,
    minPriority = 0.8
  ): LearningObjective[] {
    const curriculum = this.getCurriculum(grade, subject);
    if (!curriculum) return [];

    const priorities: LearningObjective[] = [];
    for (const unit of curriculum.units) {
      for (const lesson of unit.lessons) {
        priorities.push(
          ...lesson.learningObjectives.filter(
            (obj) => obj.examPriority >= minPriority
          )
        );
      }
    }
    return priorities.sort((a, b) => b.examPriority - a.examPriority);
  }

  /**
   * Search lessons by topic tag
   */
  static searchByTopic(topic: string): Lesson[] {
    const results: Lesson[] = [];
    const lowerTopic = topic.toLowerCase();

    for (const curriculum of CURRICULUM_DATABASE) {
      for (const unit of curriculum.units) {
        for (const lesson of unit.lessons) {
          if (lesson.topicTags.some((tag) => tag.includes(lowerTopic))) {
            results.push(lesson);
          }
        }
      }
    }
    return results;
  }
}

export default CURRICULUM_DATABASE;
