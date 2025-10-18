import type React from 'react';
import { EXAM_CATEGORIES } from './constants';

// From constants.ts
export interface ActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// All possible views in the app
export type View =
  | 'dashboard'
  | 'student-registry'
  | 'register-attendance'
  | 'follow-up-attendance'
  | 'schedule'
  | 'exams'
  | 'centers'
  | 'monthly-payment'
  | 'send-message'
  | 'settings'
  | 'reminders';


// Data structure for a student group
export interface Group {
  id: string;
  name: string;
  days?: string[];
  time?: string;
}

// Data structure for a teaching center
export interface Center {
  id: string;
  name: string;
  groupsByGrade: Record<string, Group[]>;
}

// Data structure for a student
export interface Student {
  id: string;
  name:string;
  centerId: string;
  grade: string;
  groupId: string;
  studentPhone: string;
  parentPhone: string;
  whatsapp: string;
  studentCode: string;
}

// Attendance related types
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type HomeworkStatus = 'done' | 'not_done' | 'incomplete';

export interface AttendanceRecord {
    id: string; // e.g., `${studentId}-${date}`
    studentId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    homeworkStatus: HomeworkStatus;
    examGrade: string;
}

// Theme type
export type Theme = 'light' | 'dark';

// Payment record type
export interface PaymentRecord {
    id: string; // e.g., `${studentId}-${year}-${month}`
    studentId: string;
    year: number;
    month: number;
    amount: number;
    paymentDate: string; // YYYY-MM-DD
    note?: string;
}

// Exam types
export type ExamCategory = typeof EXAM_CATEGORIES[number];

export interface Exam {
  id: string;
  title: string;
  category: ExamCategory;
  fileDataUrl: string;
  fileName: string;
  fileType: string;
}

// Reminder (To-Do) type
export interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null; // ISO string for date and time
}

// WhatsApp Group type
export interface WhatsAppGroup {
  id: string;
  name: string;
  link: string;
}
