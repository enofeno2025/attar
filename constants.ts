import type { ActionItem } from './types';
import {
  UserIcon,
  CalendarPlusIcon,
  FileTextIcon,
  ClockIcon,
  ClipboardCheckIcon,
  BuildingIcon,
  DollarSignIcon,
  SendIcon,
} from './components/Icons';

export const ACTION_ITEMS: ActionItem[] = [
  { id: 'student-registry', label: 'سجل الطلاب', icon: UserIcon },
  { id: 'register-attendance', label: 'تسجيل الحضور', icon: CalendarPlusIcon },
  { id: 'follow-up-attendance', label: 'متابعة الحضور', icon: FileTextIcon },
  { id: 'centers', label: 'السناتر', icon: BuildingIcon },
  { id: 'send-message', label: 'إرسال رسالة', icon: SendIcon },
  { id: 'monthly-payment', label: 'بالشهر', icon: DollarSignIcon },
  { id: 'exams', label: 'الاختبارات', icon: ClipboardCheckIcon },
  { id: 'schedule', label: 'جدول المواعيد', icon: ClockIcon },
];

export const GRADES = [
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
];

export const EXAM_CATEGORIES = [
  'امتحان الحصة',
  'امتحان شامل على الوحدة',
  'امتحان شامل على ربع المنهج',
  'امتحان شامل على نصف المنهج',
  'امتحان شامل على المنهج',
  'أسئلة أوائل الطلبة'
] as const;