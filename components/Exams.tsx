import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, PlusIcon, ShareIcon, DownloadIcon, TrashIcon, UploadIcon } from './Icons';
import type { Exam, ExamCategory } from '../types';
import { EXAM_CATEGORIES } from '../constants';

interface ExamsProps {
  onBack: () => void;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
}

// FIX: Explicitly type initialFormState to prevent incorrect type inference for the 'category' field.
// The useState hook for newExamData was inferring the type of 'category' as just the first value
// ("امتحان الحصة") instead of the full ExamCategory union type.
const initialFormState: Omit<Exam, 'id'> = {
  title: '',
  category: EXAM_CATEGORIES[0],
  fileDataUrl: '',
  fileName: '',
  fileType: '',
};

const Exams: React.FC<ExamsProps> = ({ onBack, exams, setExams }) => {
  const [activeTab, setActiveTab] = useState<ExamCategory>(EXAM_CATEGORIES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExamData, setNewExamData] = useState(initialFormState);
  const [fileError, setFileError] = useState('');

  const filteredExams = useMemo(() => exams.filter(e => e.category === activeTab), [exams, activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFileError('حجم الملف كبير جدًا (الحد الأقصى 5 ميجابايت).');
        return;
      }
      setFileError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExamData(prev => ({
          ...prev,
          fileDataUrl: reader.result as string,
          fileName: file.name,
          fileType: file.type,
        }));
      };
      reader.onerror = () => {
        setFileError('حدث خطأ أثناء قراءة الملف.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamData.title || !newExamData.fileDataUrl) {
      alert('يرجى إدخال عنوان للاختبار ورفع الملف.');
      return;
    }
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      ...newExamData,
    };
    setExams(prev => [...prev, newExam]);
    setIsModalOpen(false);
    setNewExamData(initialFormState);
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      setExams(prev => prev.filter(exam => exam.id !== id));
    }
  };

  const handleDownload = (exam: Exam) => {
    const link = document.createElement('a');
    link.href = exam.fileDataUrl;
    link.download = exam.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async (exam: Exam) => {
    try {
        const response = await fetch(exam.fileDataUrl);
        const blob = await response.blob();
        const file = new File([blob], exam.fileName, { type: exam.fileType });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: exam.title,
                text: `اختبار: ${exam.title}`,
                files: [file],
            });
        } else {
            alert('المشاركة غير مدعومة على هذا المتصفح. يمكنك تنزيل الملف ومشاركته يدويًا.');
        }
    } catch (error) {
        console.error('Error sharing file:', error);
        alert('حدث خطأ أثناء محاولة مشاركة الملف.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">الاختبارات</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>
      
      <div>
        <label htmlFor="exam-category-select" className="sr-only">تصنيف الاختبار</label>
        <select
            id="exam-category-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as ExamCategory)}
            className="input-style w-full"
        >
            {EXAM_CATEGORIES.map(category => (
                <option key={category} value={category}>
                    {category}
                </option>
            ))}
        </select>
      </div>
      
      <div className="flex flex-col gap-3">
        {filteredExams.length > 0 ? (
          filteredExams.map(exam => (
            <div key={exam.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-3">
              <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{exam.title}</p>
              <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-slate-700 pt-3">
                <button onClick={() => handleShare(exam)} className="action-button bg-blue-500 hover:bg-blue-600" title="مشاركة"><ShareIcon className="w-5 h-5"/></button>
                <button onClick={() => handleDownload(exam)} className="action-button bg-green-500 hover:bg-green-600" title="تنزيل"><DownloadIcon className="w-5 h-5"/></button>
                <button onClick={() => handleDeleteExam(exam.id)} className="action-button bg-red-500 hover:bg-red-600" title="حذف"><TrashIcon className="w-5 h-5"/></button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400">لا توجد اختبارات في هذا التصنيف بعد.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md font-semibold hover:bg-teal-600 transition-colors">
              أضف اختبارًا الآن
            </button>
          </div>
        )}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-4 z-20 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg" aria-label="إضافة اختبار جديد">
          <PlusIcon className="w-7 h-7" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center">إضافة اختبار جديد</h3>
                <form onSubmit={handleSaveExam} className="flex flex-col gap-4">
                    <input type="text" value={newExamData.title} onChange={e => setNewExamData(p => ({...p, title: e.target.value}))} placeholder="عنوان الاختبار" className="input-style" required />
                    <select value={newExamData.category} onChange={e => setNewExamData(p => ({...p, category: e.target.value as ExamCategory}))} className="input-style">
                        {EXAM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div>
                        <label htmlFor="examFile" className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 rounded-lg shadow-sm tracking-wide border-2 border-dashed border-teal-400 dark:border-teal-600 cursor-pointer hover:bg-teal-50 dark:hover:bg-slate-600">
                            <UploadIcon className="w-8 h-8"/>
                            <span className="mt-2 text-base leading-normal">{newExamData.fileName || 'اختر ملفًا (PDF, صورة, Word)'}</span>
                            <input id="examFile" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,image/*,.application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                        </label>
                        {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
      )}
       <style>{`
        .input-style { 
            background-color: #f8fafc; 
            border: 1px solid #cbd5e1; 
            border-radius: 0.375rem; 
            padding: 0.75rem; 
            color: #1e2b3b; 
            width: 100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .dark .input-style { background-color: #334155; border-color: #475569; color: #f1f5f9; }
        .action-button { color: white; border-radius: 9999px; padding: 0.5rem; display: inline-flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
      `}</style>
    </div>
  );
};

export default Exams;