import React, { useState, useEffect } from 'react';
import type { View, Student, Center, AttendanceRecord, PaymentRecord, Theme, Exam, Reminder } from './types';

// Import all components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import StudentRegistry from './components/StudentRegistry';
import CentersManagement from './components/CentersManagement';
import AttendanceRegistry from './components/AttendanceRegistry';
import FollowUpAttendance from './components/FollowUpAttendance';
import SendMessage from './components/SendMessage';
import MonthlyPayment from './components/MonthlyPayment';
import Exams from './components/Exams';
import Settings from './components/Settings';
import LockScreen from './components/LockScreen';
import Schedule from './components/Schedule';
import Reminders from './components/Reminders';
import { ACTION_ITEMS } from './constants';

// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", key, error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
         alert('فشلت عملية الحفظ. مساحة التخزين ممتلئة. قد تحتاج إلى حذف بعض البيانات القديمة (مثل الطلاب أو الاختبارات) لتوفير مساحة.');
      } else {
         alert('حدث خطأ غير متوقع أثناء حفظ البيانات.');
      }
    }
  };

  return [storedValue, setValue];
}

const App: React.FC = () => {
  // App state
  const [view, setView] = useState<View>('dashboard');
  const [teacherName, setTeacherName] = useLocalStorage('teacherName', 'مستر/هانى العطار');
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [centers, setCenters] = useLocalStorage<Center[]>('centers', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);
  const [paymentRecords, setPaymentRecords] = useLocalStorage<PaymentRecord[]>('paymentRecords', []);
  const [exams, setExams] = useLocalStorage<Exam[]>('exams', []);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const [isLocked, setIsLocked] = useState(() => {
      if (typeof window === 'undefined') return false;
      return !!window.localStorage.getItem('teachers_assistant_password');
  });

  // Effect to handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  // Effect for PWA installation prompt and standalone check
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Navigation handler
  const handleNavigate = (newView: View) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const lockApp = () => setIsLocked(true);

  // Handler for triggering the installation
  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }
    installPromptEvent.prompt();
    // userChoice is a promise that resolves with an object containing an outcome property.
    const { outcome } = await installPromptEvent.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We can only use the prompt once. Clear it.
    setInstallPromptEvent(null);
  };

  // If locked, show lock screen
  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }
  
  const VIEW_LABELS: Record<View, string> = {
    'dashboard': teacherName,
    'student-registry': 'سجل الطلاب',
    'register-attendance': 'تسجيل الحضور',
    'follow-up-attendance': 'متابعة الحضور',
    'schedule': 'جدول المواعيد',
    'exams': 'الاختبارات',
    'centers': 'السناتر',
    'monthly-payment': 'بالشهر',
    'send-message': 'إرسال رسالة',
    'settings': 'الإعدادات',
    'reminders': 'تذكر'
  };

  // Component mapping
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'student-registry':
        return <StudentRegistry onBack={() => handleNavigate('dashboard')} students={students} setStudents={setStudents} centers={centers} />;
      case 'centers':
        return <CentersManagement onBack={() => handleNavigate('dashboard')} centers={centers} setCenters={setCenters} />;
      case 'register-attendance':
        return <AttendanceRegistry onBack={() => handleNavigate('dashboard')} students={students} centers={centers} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />;
      case 'follow-up-attendance':
        return <FollowUpAttendance onBack={() => handleNavigate('dashboard')} students={students} centers={centers} attendanceRecords={attendanceRecords} />;
      case 'send-message':
        return <SendMessage onBack={() => handleNavigate('dashboard')} students={students} centers={centers} />;
      case 'monthly-payment':
        return <MonthlyPayment onBack={() => handleNavigate('dashboard')} students={students} centers={centers} paymentRecords={paymentRecords} setPaymentRecords={setPaymentRecords} />;
      case 'exams':
        return <Exams onBack={() => handleNavigate('dashboard')} exams={exams} setExams={setExams} />;
      case 'settings':
        return <Settings onBack={() => handleNavigate('dashboard')} teacherName={teacherName} setTeacherName={setTeacherName} theme={theme} setTheme={setTheme} lockApp={lockApp} installPromptEvent={installPromptEvent} handleInstall={handleInstall} isStandalone={isStandalone} />;
      case 'schedule':
        return <Schedule onBack={() => handleNavigate('dashboard')} centers={centers} students={students} />;
      case 'reminders':
        return <Reminders onBack={() => handleNavigate('dashboard')} reminders={reminders} setReminders={setReminders} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const currentViewLabel = VIEW_LABELS[view] || teacherName;

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800 shadow-lg min-h-screen flex flex-col">
        <Header name={view === 'dashboard' ? teacherName : currentViewLabel} isDashboard={view === 'dashboard'} />
        <main className="flex-grow p-4 pb-28">
          {renderView()}
        </main>
        <BottomNav onNavigate={handleNavigate} currentView={view} />
      </div>
    </div>
  );
};

export default App;
