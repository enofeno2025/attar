import React from 'react';
import type { Center, Student } from '../types';
// FIX: Import `UserIcon` to resolve reference error.
import { ArrowLeftIcon, BuildingIcon, UsersIcon, CalendarDaysIcon, ClockIcon, UserIcon } from './Icons';

interface ScheduleProps {
  onBack: () => void;
  centers: Center[];
  students: Student[];
}

const Schedule: React.FC<ScheduleProps> = ({ onBack, centers, students }) => {
  // Flatten the schedule data from centers and groups
  const scheduleItems = centers.flatMap(center =>
    Object.entries(center.groupsByGrade).flatMap(([grade, groups]) =>
      groups
        .filter(group => group.days && group.time && group.days.length > 0) // Only show groups with schedule info
        .map(group => {
          const studentCount = students.filter(s => s.groupId === group.id).length;
          return {
            id: `${center.id}-${group.id}`,
            centerName: center.name,
            grade,
            groupName: group.name,
            days: group.days!,
            time: group.time!,
            studentCount,
          };
        })
    )
  ).sort((a, b) => a.centerName.localeCompare(b.centerName)); // Sort by center name

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">جدول المواعيد</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {scheduleItems.length > 0 ? (
          scheduleItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3 border-b border-gray-200 dark:border-slate-700 pb-3">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-full">
                    <BuildingIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{item.centerName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <InfoItem icon={UsersIcon} label="المجموعة" value={`${item.grade} - ${item.groupName}`} />
                <InfoItem icon={CalendarDaysIcon} label="الأيام" value={item.days.join('، ')} />
                <InfoItem icon={ClockIcon} label="الوقت" value={item.time} />
                <InfoItem icon={UserIcon} label="الطلاب" value={`${item.studentCount} طالب`} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400">لا توجد مواعيد مسجلة.</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">اذهب إلى شاشة "السناتر" لإضافة أيام وتوقيتات للمجموعات.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{icon: React.ComponentType<{className?: string}>, label: string, value: string}> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2">
        <Icon className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col">
            <span className="font-semibold text-gray-500 dark:text-slate-400 text-xs">{label}</span>
            <span className="font-medium text-gray-800 dark:text-slate-200">{value}</span>
        </div>
    </div>
);

export default Schedule;
