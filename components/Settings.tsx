import React, { useState } from 'react';
import type { Theme } from '../types';
import { ArrowLeftIcon, ShareIcon, TrashIcon, LockIcon, DownloadIcon, UploadIcon } from './Icons';

interface SettingsProps {
  onBack: () => void;
  teacherName: string;
  setTeacherName: (name: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lockApp: () => void;
  installPromptEvent: any;
  handleInstall: () => void;
  isStandalone: boolean;
}

const PASSWORD_STORAGE_KEY = 'teachers_assistant_password';

// A list of all keys managed by the application in localStorage.
const LOCAL_STORAGE_KEYS = [
  'teacherName',
  'students',
  'centers',
  'attendanceRecords',
  'paymentRecords',
  'exams',
  'reminders',
  'theme',
  'teachers_assistant_message_templates',
  'teachers_assistant_whatsapp_groups',
  'teachers_assistant_password'
];

/**
 * Defines the structure for the new, more robust backup format.
 */
interface AppBackup {
  __app_id: 'teachers-assistant';
  __backup_version: 1;
  exportedAt: string;
  data: Record<string, any>;
}


const Settings: React.FC<SettingsProps> = ({ onBack, teacherName, setTeacherName, theme, setTheme, lockApp, installPromptEvent, handleInstall, isStandalone }) => {
  const [hasPassword, setHasPassword] = useState(() => !!window.localStorage.getItem(PASSWORD_STORAGE_KEY));
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareData = {
      title: "تطبيق مساعد المدرس",
      text: "استخدم تطبيق مساعد المدرس لتنظيم الفصول والطلاب بكل سهولة!",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('تم نسخ رابط التطبيق! يمكنك الآن لصقه ومشاركته.');
      }
    } catch (err) {
      console.error("Error sharing:", err);
      if ((err as Error).name !== 'AbortError') {
        alert('حدث خطأ أثناء محاولة المشاركة.');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSavePassword = () => {
      setPasswordError('');
      if (newPassword.length < 4) {
          setPasswordError('يجب أن تكون كلمة المرور 4 أحرف على الأقل.');
          return;
      }
      if (newPassword !== confirmPassword) {
          setPasswordError('كلمتا المرور غير متطابقتين.');
          return;
      }
      
      window.localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(newPassword));
      setHasPassword(true);
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('تم تعيين كلمة المرور بنجاح! سيتم قفل التطبيق الآن.');
      lockApp();
  };

  const handleRemovePassword = () => {
    if (window.confirm('هل أنت متأكد من إزالة كلمة المرور؟')) {
      window.localStorage.removeItem(PASSWORD_STORAGE_KEY);
      setHasPassword(false);
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      alert('تم إزالة كلمة المرور بنجاح.');
    }
  };

  /**
   * NEW: Handles exporting data in a structured, versioned format.
   */
  const handleExportData = () => {
    try {
      const backupData: Record<string, any> = {};
      LOCAL_STORAGE_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item !== null) {
          try {
            // Store the actual parsed data, not the raw string from localStorage.
            backupData[key] = JSON.parse(item);
          } catch {
            // For edge cases where a value might not be valid JSON (e.g., very old password), store as is.
            backupData[key] = item;
          }
        }
      });

      const backupFile: AppBackup = {
        __app_id: 'teachers-assistant',
        __backup_version: 1,
        exportedAt: new Date().toISOString(),
        data: backupData,
      };

      const jsonString = JSON.stringify(backupFile, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.download = `teachers_assistant_backup_${today}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('تم تصدير النسخة الاحتياطية بنجاح!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('حدث خطأ أثناء تصدير البيانات.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    event.target.value = ''; 
  };
  
  /**
   * NEW: Completely rebuilt import logic to handle both old and new backup formats robustly.
   */
  const handleConfirmImport = () => {
    if (!selectedFile) return;

    if (!window.confirm('هل أنت متأكد من استيراد نسخة احتياطية؟ سيتم الكتابة فوق جميع بياناتك الحالية. لا يمكن التراجع عن هذا الإجراء.')) {
      setSelectedFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        alert('فشل في قراءة الملف.');
        setSelectedFile(null);
        return;
      }

      // 1. Create a safe backup of the current data before touching anything.
      const originalDataBackup: Record<string, string | null> = {};
      LOCAL_STORAGE_KEYS.forEach(key => {
          originalDataBackup[key] = localStorage.getItem(key);
      });

      try {
        const parsedFile = JSON.parse(text);
        
        let dataToRestore: Record<string, any>;
        let isNewFormat = false;

        // 2. Intelligently detect the backup format.
        if (parsedFile && parsedFile.__app_id === 'teachers-assistant' && parsedFile.data) {
          // It's the new, structured format.
          dataToRestore = parsedFile.data;
          isNewFormat = true;
        } else if (typeof parsedFile === 'object' && parsedFile !== null && !Array.isArray(parsedFile)) {
          // It's the old format (a direct dump of localStorage key-value strings).
          dataToRestore = parsedFile;
        } else {
          throw new Error('الملف غير صالح أو ليس ملف نسخة احتياطية متوافق.');
        }

        // 3. If format is valid, proceed with restoration.
        // First, clear all existing application data.
        LOCAL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        
        // Then, write the new data from the backup file.
        for (const key of LOCAL_STORAGE_KEYS) {
          if (dataToRestore.hasOwnProperty(key)) {
            const value = dataToRestore[key];
            if (value !== null && value !== undefined) {
              if (isNewFormat) {
                // In the new format, the data is parsed, so we must stringify it again for localStorage.
                localStorage.setItem(key, JSON.stringify(value));
              } else {
                // In the old format, the data is already a string. We store it directly.
                if (typeof value !== 'string') {
                    // This provides safety for corrupted old-format files.
                    throw new Error(`تنسيق قديم تالف للمفتاح '${key}'. القيمة يجب أن تكون نصية.`);
                }
                localStorage.setItem(key, value);
              }
            }
          }
        }
        
        alert('تم استيراد البيانات بنجاح! سيتم إعادة تحميل التطبيق الآن.');
        window.location.reload();

      } catch (error) {
        // 4. If any error occurs during the process, restore the original data.
        console.error('Error importing data:', error);
        alert(`فشل استيراد البيانات: ${(error as Error).message}\n\nتم الحفاظ على بياناتك الحالية دون تغيير.`);
        
        try {
          LOCAL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
          Object.keys(originalDataBackup).forEach(key => {
            const value = originalDataBackup[key];
            if (value !== null) {
                localStorage.setItem(key, value);
            }
          });
        } catch (restoreError) {
          console.error('CRITICAL: Failed to restore backup data!', restoreError);
          alert('حدث خطأ حرج أثناء محاولة استرجاع بياناتك. قد تحتاج إلى إعادة تحميل التطبيق.');
        }

      } finally {
        setSelectedFile(null);
      }
    };
    
    reader.onerror = () => {
        alert('حدث خطأ أثناء قراءة الملف. قد يكون الملف تالفًا.');
        setSelectedFile(null);
    };

    reader.readAsText(selectedFile);
  };


  const handleClearData = () => {
    if (window.confirm('تحذير: أنت على وشك مسح جميع بيانات التطبيق نهائياً. هل أنت متأكد؟')) {
        if (window.confirm('هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد تماماً من رغبتك في المتابعة؟')) {
            try {
                LOCAL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
                alert('تم مسح جميع البيانات. سيتم إعادة تحميل التطبيق الآن.');
                window.location.reload();
            } catch (error) {
                console.error('Error clearing data:', error);
                alert('حدث خطأ أثناء محاولة مسح البيانات.');
            }
        }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">الإعدادات</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <SettingsSection title="التخصيص">
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <label htmlFor="teacherName" className="font-semibold text-slate-700 dark:text-slate-300">اسم المدرس</label>
            <input 
                id="teacherName"
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="input-style"
            />
        </div>
      </SettingsSection>
      
      <SettingsSection title="المظهر">
        <SettingsItem label="الوضع الليلي">
            <button onClick={toggleTheme} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 p-1 rounded-full">
               <span className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${theme === 'light' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>
                   نهاري
               </span>
               <span className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${theme === 'dark' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-500'}`}>
                   ليلي
               </span>
            </button>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="المشاركة والأمان">
        <SettingsButton icon={ShareIcon} label="مشاركة رابط التطبيق" onClick={handleShare} />

        {installPromptEvent && !isStandalone && (
          <SettingsButton
            icon={DownloadIcon}
            label="تثبيت التطبيق على الجهاز"
            onClick={handleInstall}
          />
        )}

        {!installPromptEvent && !isStandalone && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 text-sm">
                <h4 className="font-bold mb-2 text-slate-800 dark:text-slate-200">تثبيت التطبيق للوصول السريع</h4>
                {isIos ? (
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        لتثبيت التطبيق على جهازك، اضغط على زر المشاركة <ShareIcon className="w-4 h-4 inline-block mx-1" /> في متصفح سفاري، ثم اختر "إضافة إلى الشاشة الرئيسية".
                    </p>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        يمكنك تثبيت هذا التطبيق على جهازك. ابحث عن خيار "تثبيت" أو "إضافة إلى الشاشة الرئيسية" في قائمة متصفحك.
                    </p>
                )}
            </div>
        )}
        
        <SettingsButton icon={LockIcon} label={hasPassword ? 'تغيير أو إزالة كلمة المرور' : 'تأمين التطبيق بكلمة مرور'} onClick={() => setShowPasswordForm(!showPasswordForm)} />
         {showPasswordForm && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-4 animate-fade-in">
                <h4 className="font-semibold text-center text-slate-800 dark:text-slate-200">{hasPassword ? 'تغيير كلمة المرور' : 'تعيين كلمة مرور جديدة'}</h4>
                <input 
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-style"
                />
                 <input 
                    type="password"
                    placeholder="تأكيد كلمة المرور الجديدة"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-style"
                />
                {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
                <div className="flex gap-2 justify-center mt-2">
                    <button onClick={handleSavePassword} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                        حفظ
                    </button>
                    {hasPassword && (
                        <button onClick={handleRemovePassword} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                            إزالة
                        </button>
                    )}
                     <button onClick={() => setShowPasswordForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-md transition-colors">
                        إلغاء
                    </button>
                </div>
            </div>
        )}
      </SettingsSection>

      <SettingsSection title="إدارة البيانات">
        <input
            type="file"
            id="import-backup-input"
            onChange={handleFileSelect}
            accept="application/json,.json"
            className="hidden"
        />
        <SettingsButton icon={DownloadIcon} label="تصدير نسخة احتياطية" onClick={handleExportData} />
        
        {!selectedFile ? (
          <label htmlFor="import-backup-input" className="w-full bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-4 text-right hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-slate-800 dark:text-slate-200 cursor-pointer">
              <UploadIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <span className="font-semibold">استيراد نسخة احتياطية</span>
          </label>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border-2 border-teal-500 flex flex-col gap-3 animate-fade-in">
            <p className="text-center font-semibold text-slate-800 dark:text-slate-200">ملف جاهز للاستيراد:</p>
            <p className="text-center text-sm text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 p-2 rounded truncate" title={selectedFile.name}>{selectedFile.name}</p>
            <div className="flex gap-2 justify-center mt-2">
              <button onClick={handleConfirmImport} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                تأكيد الاستيراد
              </button>
              <button onClick={() => setSelectedFile(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 font-bold py-2 px-6 rounded-md transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        )}

        <SettingsButton icon={TrashIcon} label="مسح جميع البيانات" destructive onClick={handleClearData} />
      </SettingsSection>
      <style>{`
      .input-style { background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #1e293b; width: 100%; } 
      .input-style:focus { outline: none; box-shadow: 0 0 0 2px #14b8a6; } 
      .dark .input-style { background-color: #334155; border-color: #475569; color: #f1f5f9; }
      @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

const SettingsSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 border-b-2 border-teal-500/20 pb-2">{title}</h3>
        <div className="flex flex-col gap-3">
            {children}
        </div>
    </div>
);

const SettingsItem: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center shadow-sm border border-gray-200 dark:border-slate-700">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        {children}
    </div>
);

const SettingsButton: React.FC<{icon: React.FC<{className?:string}>, label: string, onClick: () => void, destructive?: boolean}> = ({icon: Icon, label, onClick, destructive = false}) => (
     <button 
        onClick={onClick} 
        className={`w-full bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-4 text-right hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${destructive ? 'text-red-600 dark:text-red-500' : 'text-slate-800 dark:text-slate-200'}`}
     >
        <Icon className={`w-6 h-6 ${destructive ? '' : 'text-teal-600 dark:text-teal-400'}`} />
        <span className="font-semibold">{label}</span>
    </button>
);


export default Settings;