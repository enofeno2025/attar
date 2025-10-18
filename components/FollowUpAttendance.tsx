import React, { useState, useMemo } from 'react';
import type { Student, Center, AttendanceRecord, AttendanceStatus, HomeworkStatus, Group } from '../types';
import { ArrowLeftIcon, SendIcon } from './Icons';

interface FollowUpAttendanceProps {
  onBack: () => void;
  students: Student[];
  centers: Center[];
  attendanceRecords: AttendanceRecord[];
}

const attendanceStatusMap: Record<AttendanceStatus, { label: string, color: string }> = {
  present: { label: 'حاضر', color: 'text-green-500' },
  absent: { label: 'غائب', color: 'text-red-500' },
  late: { label: 'متأخر', color: 'text-yellow-500' },
};

const homeworkStatusMap: Record<HomeworkStatus, { label: string, color: string }> = {
  done: { label: 'عمل الواجب', color: 'text-gray-700 dark:text-slate-300' },
  not_done: { label: 'لم يعمل الواجب', color: 'text-red-500' },
  incomplete: { label: 'الواجب ناقص', color: 'text-yellow-500' },
};

const FollowUpAttendance: React.FC<FollowUpAttendanceProps> = ({ onBack, students, centers, attendanceRecords }) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fix: Add explicit type Group[] to useMemo to resolve type inference issues.
  const availableGroups = useMemo<Group[]>(() => {
    if (!selectedCenterId) return [];
    const center = centers.find(c => c.id === selectedCenterId);
    if (!center) return [];
    return Object.values(center.groupsByGrade).flat();
  }, [selectedCenterId, centers]);

  const filteredStudents = useMemo(() => {
    if (!selectedCenterId || !selectedGroupId) return [];
    return students.filter(s => s.centerId === selectedCenterId && s.groupId === selectedGroupId);
  }, [selectedCenterId, selectedGroupId, students]);

  const displayData = useMemo(() => {
    return filteredStudents.map(student => {
      const record = attendanceRecords.find(
        r => r.studentId === student.id && r.date === selectedDate
      );
      return {
        studentId: student.id,
        studentName: student.name,
        whatsapp: student.whatsapp || student.parentPhone,
        record,
      };
    });
  }, [filteredStudents, attendanceRecords, selectedDate]);

  const handleSendMessage = (studentName: string, whatsappNumber: string, record: AttendanceRecord) => {
    if (!whatsappNumber) {
        alert('لا يوجد رقم واتساب مسجل لهذا الطالب.');
        return;
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const attendanceLabel = attendanceStatusMap[record.status].label;
    const homeworkLabel = record.status === 'absent' ? '—' : homeworkStatusMap[record.homeworkStatus].label;
    const examGradeText = record.status === 'absent' ? '—' : (record.examGrade || 'لم تسجل');

    // WhatsApp uses markdown-like syntax for formatting: *bold*
    const message = `*مكتب مستر/هانى العطار*
تقرير حصة اليوم بتاريخ ${formattedDate}

*للطالب/* ${studentName}
*الحضور/* ${attendanceLabel}
*الواجب/* ${homeworkLabel}
*درجة امتحان الحصة/* ${examGradeText}

*نرجو الرد من ولى الامر للتأكد من استلام الرسالة*`;

    const encodedMessage = encodeURIComponent(message);

    // Format phone number for international use (assuming Egyptian numbers)
    let formattedPhone = whatsappNumber.replace(/\s+/g, ''); // remove spaces
    if (formattedPhone.startsWith('01')) {
        formattedPhone = '20' + formattedPhone.substring(1);
    }
    
    const whatsappUri = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUri, '_blank');
  };

  const handleSendAllMessages = () => {
    const studentsToSend = displayData.filter(d => d.record && d.whatsapp);

    if (studentsToSend.length === 0) {
        alert('لا يوجد طلاب لديهم تقارير مسجلة وأرقام واتساب لإرسالها.');
        return;
    }

    const confirmation = window.confirm(
        `أنت على وشك إرسال تقارير إلى ${studentsToSend.length} طالب/طالبة. سيؤدي هذا إلى فتح نافذة واتساب لكل طالب. هل تريد المتابعة؟\n\nملاحظة: قد تحتاج إلى السماح للنافذات المنبثقة (Pop-ups) في متصفحك.`
    );

    if (confirmation) {
        studentsToSend.forEach(studentData => {
            handleSendMessage(studentData.studentName, studentData.whatsapp, studentData.record!);
        });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">متابعة الحضور</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <input 
          type="date" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)}
          className="input-style text-center"
        />
        <select value={selectedCenterId} onChange={e => { setSelectedCenterId(e.target.value); setSelectedGroupId(''); }} className="input-style">
          <option value="" disabled>-- اختر السنتر --</option>
          {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
        </select>
        <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="input-style" disabled={!selectedCenterId}>
          <option value="" disabled>-- اختر المجموعة --</option>
          {availableGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
      </div>

      {displayData.length > 0 && (
        <div className="my-2">
            <button
                onClick={handleSendAllMessages}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg"
            >
                <SendIcon className="w-5 h-5" />
                <span>إرسال التقارير للجميع عبر واتساب</span>
            </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayData.length > 0 ? (
          displayData.map(({ studentId, studentName, whatsapp, record }) => (
            <div key={studentId} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{studentName}</p>
                {record && (
                  <button 
                    onClick={() => handleSendMessage(studentName, whatsapp, record)}
                    disabled={!whatsapp}
                    className="flex items-center gap-2 bg-teal-500/90 hover:bg-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold py-1 px-3 rounded-md transition-colors"
                    aria-label="إرسال تقرير عبر واتساب"
                    title={!whatsapp ? 'لا يوجد رقم واتساب' : 'إرسال تقرير واتساب'}
                  >
                    <SendIcon className="w-4 h-4" />
                    <span>إرسال</span>
                  </button>
                )}
              </div>
              {record ? (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">الحضور</p>
                    <p className={`font-semibold ${attendanceStatusMap[record.status].color}`}>
                      {attendanceStatusMap[record.status].label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">الواجب</p>
                     <p className={`font-semibold ${record.status === 'absent' ? 'text-gray-400 dark:text-slate-500' : homeworkStatusMap[record.homeworkStatus].color}`}>
                        {record.status === 'absent' ? '—' : homeworkStatusMap[record.homeworkStatus].label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">الدرجة</p>
                    <p className={`font-semibold ${record.status === 'absent' ? 'text-gray-400 dark:text-slate-500' : 'text-teal-600 dark:text-teal-400'}`}>
                      {record.status === 'absent' ? '—' : (record.examGrade || 'لم تسجل')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-slate-400 py-2">لم يتم تسجيل حضور لهذا الطالب في اليوم المحدد.</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-slate-400 pt-4">يرجى اختيار سنتر ومجموعة لعرض البيانات.</p>
        )}
      </div>
      
       <style>{`
        .input-style {
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 0.375rem;
            padding: 0.75rem;
            color: #1e293b;
            width: 100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
        }
        .dark .input-style {
            background-color: #334155;
            border-color: #475569;
            color: #f1f5f9;
        }
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default FollowUpAttendance;