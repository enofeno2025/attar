import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Center, Group, PaymentRecord } from '../types';
import { ArrowLeftIcon, TrashIcon } from './Icons';

interface MonthlyPaymentProps {
  onBack: () => void;
  students: Student[];
  centers: Center[];
  paymentRecords: PaymentRecord[];
  setPaymentRecords: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
const months = [
  { value: 1, name: 'يناير' }, { value: 2, name: 'فبراير' }, { value: 3, name: 'مارس' },
  { value: 4, name: 'أبريل' }, { value: 5, name: 'مايو' }, { value: 6, name: 'يونيو' },
  { value: 7, name: 'يوليو' }, { value: 8, name: 'أغسطس' }, { value: 9, name: 'سبتمبر' },
  { value: 10, name: 'أكتوبر' }, { value: 11, name: 'نوفمبر' }, { value: 12, name: 'ديسمبر' },
];

const initialFormState = {
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
};

const MonthlyPayment: React.FC<MonthlyPaymentProps> = ({ onBack, students, centers, paymentRecords, setPaymentRecords }) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<{ student: Student; record?: PaymentRecord } | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  
  useEffect(() => {
    if (editingInfo) {
      if (editingInfo.record) {
        setFormData({
          amount: String(editingInfo.record.amount),
          paymentDate: editingInfo.record.paymentDate,
          note: editingInfo.record.note || '',
        });
      } else {
        setFormData(initialFormState);
      }
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [editingInfo]);

  const availableGroups = useMemo<Group[]>(() => {
    if (!selectedCenterId) return [];
    const center = centers.find(c => c.id === selectedCenterId);
    return center ? Object.values(center.groupsByGrade).flat() : [];
  }, [selectedCenterId, centers]);

  const filteredStudents = useMemo(() => {
    if (!selectedGroupId) return [];
    return students.filter(s => s.groupId === selectedGroupId);
  }, [selectedGroupId, students]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInfo || !formData.amount) return;

    const recordId = `${editingInfo.student.id}-${selectedYear}-${selectedMonth}`;
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount <= 0) {
        alert("يرجى إدخال مبلغ صحيح.");
        return;
    }

    const newRecord: PaymentRecord = {
        id: recordId,
        studentId: editingInfo.student.id,
        year: selectedYear,
        month: selectedMonth,
        amount,
        paymentDate: formData.paymentDate,
        note: formData.note.trim() || undefined,
    };

    setPaymentRecords(prev => {
        const existingIndex = prev.findIndex(r => r.id === recordId);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = newRecord;
            return updated;
        }
        return [...prev, newRecord];
    });

    setEditingInfo(null);
  };
  
  const handleDelete = (recordId: string) => {
    if (window.confirm('هل أنت متأكد من حذف سجل الدفع هذا؟')) {
        setPaymentRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">متابعة الدفع الشهري</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-2">
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="input-style">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="input-style">
                {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
        </div>
        <select value={selectedCenterId} onChange={e => { setSelectedCenterId(e.target.value); setSelectedGroupId(''); }} className="input-style">
          <option value="" disabled>-- اختر السنتر --</option>
          {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
        </select>
        <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="input-style" disabled={!selectedCenterId}>
          <option value="" disabled>-- اختر المجموعة --</option>
          {availableGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => {
            const record = paymentRecords.find(r => r.studentId === student.id && r.year === selectedYear && r.month === selectedMonth);
            return (
              <div key={student.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{student.name}</p>
                    <button 
                        onClick={() => setEditingInfo({ student, record })}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${record ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
                    >
                        {record ? 'تعديل' : 'تسجيل الدفع'}
                    </button>
                </div>
                {record ? (
                    <div className="text-sm border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                       <p className="flex justify-between">
                           <span className="font-semibold text-green-600 dark:text-green-400">الحالة:</span>
                           <span className="font-bold text-green-600 dark:text-green-400">تم الدفع</span>
                       </p>
                       <p className="flex justify-between">
                           <span className="text-gray-600 dark:text-slate-400">المبلغ:</span>
                           <span>{record.amount} جنيه</span>
                       </p>
                       <p className="flex justify-between">
                           <span className="text-gray-600 dark:text-slate-400">تاريخ الدفع:</span>
                           <span>{new Date(record.paymentDate).toLocaleDateString('ar-EG')}</span>
                       </p>
                       {record.note && <p className="text-gray-600 dark:text-slate-400 mt-1">ملحوظة: <span className="text-gray-800 dark:text-slate-200">{record.note}</span></p>}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-slate-400 py-2">لم يتم الدفع</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-slate-400 pt-4">يرجى اختيار سنتر ومجموعة لعرض الطلاب.</p>
        )}
      </div>

      {isModalOpen && editingInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setEditingInfo(null)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center">دفع للطالب: {editingInfo.student.name}</h3>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">المبلغ</label>
                        <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleFormChange} required className="input-style"/>
                    </div>
                     <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">تاريخ الدفع</label>
                        <input type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleFormChange} required className="input-style"/>
                    </div>
                     <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">ملحوظة (اختياري)</label>
                        <textarea id="note" name="note" value={formData.note} onChange={handleFormChange} rows={2} className="input-style"></textarea>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        {editingInfo.record && <button type="button" onClick={() => { handleDelete(editingInfo.record!.id); setEditingInfo(null); }} className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"><TrashIcon className="w-4 h-4" /> حذف</button>}
                        <button type="button" onClick={() => setEditingInfo(null)} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <style>{`
        .input-style {
            background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 0.375rem;
            padding: 0.75rem; color: #1e293b; width: 100%;
            -webkit-appearance: none; -moz-appearance: none; appearance: none;
        }
        .dark .input-style {
            background-color: #334155; border-color: #475569; color: #f1f5f9;
        }
         input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
        }
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default MonthlyPayment;