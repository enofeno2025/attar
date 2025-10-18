import React, { useState, useEffect } from 'react';
import type { Student, Center, Group } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from './Icons';
import { GRADES } from '../constants';

interface StudentRegistryProps {
  onBack: () => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  centers: Center[];
}

const initialFormState: Omit<Student, 'id'> = {
  name: '',
  centerId: '',
  grade: '',
  groupId: '',
  studentPhone: '',
  parentPhone: '',
  whatsapp: '',
  studentCode: '',
};

const StudentRegistry: React.FC<StudentRegistryProps> = ({ onBack, students, setStudents, centers }) => {
  const [formState, setFormState] = useState(initialFormState);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [showNoGroupsMessage, setShowNoGroupsMessage] = useState(false);

  // Effect to update the list of available groups when center or grade changes.
  useEffect(() => {
    if (formState.centerId && formState.grade) {
      const center = centers.find(c => c.id === formState.centerId);
      const newGroups = center?.groupsByGrade[formState.grade] || [];
      setAvailableGroups(newGroups);
      setShowNoGroupsMessage(newGroups.length === 0);
    } else {
      setAvailableGroups([]);
      setShowNoGroupsMessage(false);
    }
  }, [formState.centerId, formState.grade, centers]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => {
      const newState = { ...prevState, [name]: value };
      
      if (name === 'centerId' || name === 'grade') {
        newState.groupId = '';
      }
      
      return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.centerId || !formState.grade || !formState.groupId || !formState.studentCode) {
        alert('يرجى ملء الحقول الإلزامية: الاسم، السنتر، الصف، المجموعة، وكود الطالب.');
        return;
    }

    if (editingStudentId) {
        // Update existing student
        setStudents(prev => prev.map(s => s.id === editingStudentId ? { ...formState, id: editingStudentId } : s));
        alert('تم تحديث بيانات الطالب بنجاح!');
    } else {
        // Add new student
        const newStudent: Student = {
            id: `s${Date.now()}`,
            ...formState,
        };
        setStudents(prevStudents => [...prevStudents, newStudent]);
    }
    
    // Reset form and editing state
    setFormState(initialFormState);
    setEditingStudentId(null);
  };
  
  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setFormState(student);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setFormState(initialFormState);
  };

  const getStudentDetails = (student: Student) => {
    const center = centers.find(c => c.id === student.centerId);
    const centerName = center?.name || 'غير محدد';
    const group = center?.groupsByGrade[student.grade]?.find(g => g.id === student.groupId);
    const groupName = group?.name || 'غير محدد';
    return { centerName, groupName };
  }
  
  let groupPlaceholder = 'اختر السنتر والصف أولاً';
  if (formState.centerId && formState.grade) {
    groupPlaceholder = availableGroups.length > 0 ? 'اختر المجموعة' : 'لا توجد مجموعات';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">سجل الطلاب</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      {/* Add/Edit Student Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-2">{editingStudentId ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
        <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="الاسم" className="input-style" required/>
        <select name="centerId" value={formState.centerId} onChange={handleInputChange} className="input-style" required>
            <option value="" disabled>اختر السنتر</option>
            {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
        </select>
        <select name="grade" value={formState.grade} onChange={handleInputChange} className="input-style" required>
            <option value="" disabled>اختر الصف</option>
            {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
        </select>
        {showNoGroupsMessage && (
            <div className="text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-3 rounded-md text-center">
                لا توجد مجموعات متاحة لهذا الصف في السنتر المختار.
                <br />
                يرجى إضافتها أولاً من شاشة <strong className="font-bold">'السناتر'</strong>.
            </div>
        )}
         <select name="groupId" value={formState.groupId} onChange={handleInputChange} className="input-style" required disabled={availableGroups.length === 0}>
            <option value="" disabled>{groupPlaceholder}</option>
            {availableGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
        <input type="tel" name="studentPhone" value={formState.studentPhone} onChange={handleInputChange} placeholder="تليفون الطالب" className="input-style"/>
        <input type="tel" name="parentPhone" value={formState.parentPhone} onChange={handleInputChange} placeholder="تليفون ولي الأمر" className="input-style"/>
        <input type="tel" name="whatsapp" value={formState.whatsapp} onChange={handleInputChange} placeholder="رقم الواتس" className="input-style"/>
        <input type="text" name="studentCode" value={formState.studentCode} onChange={handleInputChange} placeholder="كود الطالب" className="input-style" required/>
        
        <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-grow bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center gap-2 transition-colors">
              {editingStudentId ? 'تحديث البيانات' : <><PlusIcon className="w-5 h-5"/> <span>إضافة طالب</span></>}
            </button>
            {editingStudentId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors">
                إلغاء
              </button>
            )}
        </div>
      </form>

      {/* Students List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">قائمة الطلاب</h3>
        {students.map(student => {
            const { centerName, groupName } = getStudentDetails(student);
            return (
              <div key={student.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center shadow-sm border border-gray-200 dark:border-slate-700">
                  <div>
                      <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">الكود: {student.studentCode}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-500">{centerName} - {groupName}</p>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => handleStartEdit(student)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors" aria-label={`تعديل ${student.name}`}>
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors" aria-label={`حذف ${student.name}`}>
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
              </div>
            )
        })}
        {students.length === 0 && <p className="text-center text-gray-500 dark:text-slate-400">لا يوجد طلاب مسجلون بعد.</p>}
      </div>
      <style>{`
        .input-style {
            background-color: #ffffff;
            border: 1px solid #cbd5e1; /* border-slate-300 */
            border-radius: 0.375rem; /* rounded-md */
            padding: 0.5rem 0.75rem; /* px-3 py-2 */
            color: #1e293b; /* text-slate-800 */
            width: 100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .input-style:disabled {
            background-color: #f1f5f9; /* bg-slate-100 */
            cursor: not-allowed;
            opacity: 0.6;
        }
        .input-style::placeholder {
            color: #94a3b8; /* placeholder-slate-400 */
        }
        .input-style:focus {
            outline: none;
            box-shadow: 0 0 0 2px #14b8a6; /* ring-2 ring-teal-500 */
        }
        .dark .input-style {
            background-color: #334155; /* dark:bg-slate-700 */
            border-color: #475569; /* dark:border-slate-600 */
            color: #f1f5f9; /* dark:text-slate-100 */
        }
        .dark .input-style:disabled {
            background-color: #1e293b; /* dark:bg-slate-800 */
            opacity: 0.5;
        }
        .dark .input-style::placeholder {
            color: #64748b; /* dark:placeholder-slate-500 */
        }
      `}</style>
    </div>
  );
};

export default StudentRegistry;