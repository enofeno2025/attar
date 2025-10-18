import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Center, Group, AttendanceRecord, AttendanceStatus, HomeworkStatus } from '../types';
import { ArrowLeftIcon } from './Icons';

interface AttendanceRegistryProps {
  onBack: () => void;
  students: Student[];
  centers: Center[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

type AttendanceData = Record<string, {
  status: AttendanceStatus;
  homeworkStatus: HomeworkStatus;
  examGrade: string;
}>

const attendanceStatusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'حاضر' },
  { value: 'absent', label: 'غائب' },
  { value: 'late', label: 'متأخر' },
];

const homeworkStatusOptions: { value: HomeworkStatus; label: string }[] = [
  { value: 'done', label: 'عمل الواجب' },
  { value: 'not_done', label: 'لم يعمل الواجب' },
  { value: 'incomplete', label: 'الواجب ناقص' },
];

const AttendanceRegistry: React.FC<AttendanceRegistryProps> = ({ onBack, students, centers, attendanceRecords, setAttendanceRecords }) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Fix: Add explicit type Group[] to useMemo to resolve type inference issues.
  const availableGroups = useMemo<Group[]>(() => {
    if (!selectedCenterId) return [];
    const center = centers.find(c => c.id === selectedCenterId);
    if (!center) return [];
    // Flatten groups from all grades into a single list
    return Object.values(center.groupsByGrade).flat();
  }, [selectedCenterId, centers]);

  const filteredStudents = useMemo(() => {
    if (!selectedCenterId || !selectedGroupId) return [];
    return students.filter(s => s.centerId === selectedCenterId && s.groupId === selectedGroupId);
  }, [selectedCenterId, selectedGroupId, students]);
  
  // Effect to initialize attendance data when students are filtered
  useEffect(() => {
    const initialData: AttendanceData = {};
    filteredStudents.forEach(student => {
        const existingRecord = attendanceRecords.find(
            r => r.studentId === student.id && r.date === today
        );
        initialData[student.id] = {
            status: existingRecord?.status || 'present',
            homeworkStatus: existingRecord?.homeworkStatus || 'done',
            examGrade: existingRecord?.examGrade || '',
        };
    });
    setAttendanceData(initialData);
  }, [filteredStudents, attendanceRecords, today]);


  const handleAttendanceChange = (studentId: string, field: keyof AttendanceData[string], value: string) => {
    setAttendanceData(prev => {
      const updatedStudentData = {
        ...prev[studentId],
        [field]: value,
      };

      // If the student is marked as absent, reset homework and exam grade.
      if (field === 'status' && value === 'absent') {
        updatedStudentData.homeworkStatus = 'not_done'; // Reset to a neutral state.
        updatedStudentData.examGrade = ''; // Clear the exam grade.
      }

      return {
        ...prev,
        [studentId]: updatedStudentData,
      };
    });
  };

  const handleSave = () => {
    const newRecordsForVisibleStudents = Object.entries(attendanceData)
      .map(([studentId, data]) => {
        if (filteredStudents.some(s => s.id === studentId)) {
          return {
            id: `${studentId}-${today}`,
            studentId,
            date: today,
            status: data.status,
            homeworkStatus: data.homeworkStatus,
            examGrade: data.examGrade,
          };
        }
        return null;
      }).filter(Boolean) as AttendanceRecord[];

    // Get all records that are not for the currently visible students on today's date.
    // This preserves records from other groups on the same day, and all records from other days.
    const otherRecords = attendanceRecords.filter(record => {
      const isForVisibleStudentToday = record.date === today && filteredStudents.some(s => s.id === record.studentId);
      return !isForVisibleStudentToday;
    });

    setAttendanceRecords([...otherRecords, ...newRecordsForVisibleStudents]);
    alert('تم حفظ البيانات بنجاح!');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">تسجيل الحضور</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <p className="text-center text-lg font-semibold text-teal-600 dark:text-teal-400">تاريخ اليوم: {new Date().toLocaleDateString('ar-EG')}</p>
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
            const isAbsent = attendanceData[student.id]?.status === 'absent';
            return (
                <div key={student.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <p className="font-bold text-lg mb-3">{student.name}</p>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                    <label htmlFor={`attendance-${student.id}`} className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">الحالة</label>
                    <select
                        id={`attendance-${student.id}`}
                        value={attendanceData[student.id]?.status || 'present'}
                        onChange={e => handleAttendanceChange(student.id, 'status', e.target.value as AttendanceStatus)}
                        className="input-style"
                    >
                        {attendanceStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    </div>
                    <div>
                    <label htmlFor={`homework-${student.id}`} className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">الواجب</label>
                    <select
                        id={`homework-${student.id}`}
                        value={attendanceData[student.id]?.homeworkStatus || 'done'}
                        onChange={e => handleAttendanceChange(student.id, 'homeworkStatus', e.target.value as HomeworkStatus)}
                        className="input-style"
                        disabled={isAbsent}
                    >
                        {homeworkStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    </div>
                    <div>
                    <label htmlFor={`exam-${student.id}`} className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">درجة الامتحان</label>
                    <input
                        id={`exam-${student.id}`}
                        type="text"
                        placeholder={isAbsent ? '—' : 'الدرجة'}
                        value={attendanceData[student.id]?.examGrade || ''}
                        onChange={e => handleAttendanceChange(student.id, 'examGrade', e.target.value)}
                        className="input-style"
                        disabled={isAbsent}
                    />
                    </div>
                </div>
                </div>
            )
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-slate-400 pt-4">يرجى اختيار سنتر ومجموعة لعرض الطلاب.</p>
        )}
      </div>

      {filteredStudents.length > 0 && (
          <button onClick={handleSave} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-md transition-colors mt-2">
            حفظ البيانات
          </button>
      )}

      <style>{`
        .input-style {
            background-color: #ffffff;
            border: 1px solid #cbd5e1; /* border-slate-300 */
            border-radius: 0.375rem; /* rounded-md */
            padding: 0.75rem;
            color: #1e293b; /* text-slate-800 */
            width: 100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .input-style:disabled {
            background-color: #f1f5f9; /* bg-slate-100 */
            cursor: not-allowed;
            opacity: 0.7;
        }
        .input-style::placeholder {
            color: #94a3b8; /* placeholder-slate-400 */
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

export default AttendanceRegistry;