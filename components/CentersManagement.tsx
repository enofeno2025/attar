import React, { useState } from 'react';
import type { Center, Group } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon } from './Icons';
import { GRADES } from '../constants';

interface CentersManagementProps {
  onBack: () => void;
  centers: Center[];
  setCenters: React.Dispatch<React.SetStateAction<Center[]>>;
}

const daysOfWeek = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const CentersManagement: React.FC<CentersManagementProps> = ({ onBack, centers, setCenters }) => {
  const [newCenterName, setNewCenterName] = useState('');
  const [expandedCenterId, setExpandedCenterId] = useState<string | null>(null);

  // Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ centerId: string; grade: string; group?: Group } | null>(null);
  
  // Form state for modal
  const [groupName, setGroupName] = useState('');
  const [groupDays, setGroupDays] = useState<string[]>([]);
  const [groupTime, setGroupTime] = useState('');

  const handleAddCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCenterName.trim()) {
      const newCenter: Center = {
        id: `c${Date.now()}`,
        name: newCenterName.trim(),
        groupsByGrade: {},
      };
      setCenters([...centers, newCenter]);
      setNewCenterName('');
    }
  };

  const handleDeleteCenter = (centerId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السنتر؟ سيتم حذف جميع المجموعات المرتبطة به.')) {
      setCenters(centers.filter((c) => c.id !== centerId));
    }
  };
  
  const handleDeleteGroup = (centerId: string, grade: string, groupId: string) => {
     if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
        setCenters(centers.map(center => {
            if (center.id === centerId) {
                const updatedGroups = (center.groupsByGrade[grade] || []).filter(g => g.id !== groupId);
                return {
                ...center,
                groupsByGrade: { ...center.groupsByGrade, [grade]: updatedGroups },
                };
            }
            return center;
        }));
     }
  };
  
  const openAddModal = (centerId: string, grade: string) => {
    setModalData({ centerId, grade });
    setGroupName('');
    setGroupDays([]);
    setGroupTime('');
    setIsGroupModalOpen(true);
  };

  const openEditModal = (centerId: string, grade: string, group: Group) => {
    setModalData({ centerId, grade, group });
    setGroupName(group.name);
    setGroupDays(group.days || []);
    setGroupTime(group.time || '');
    setIsGroupModalOpen(true);
  };

  const closeModal = () => {
    setIsGroupModalOpen(false);
    setModalData(null);
  };

  const handleDayToggle = (day: string) => {
    setGroupDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  
   const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalData || !groupName.trim()) {
        alert("يرجى إدخال اسم للمجموعة.");
        return;
    };

    const { centerId, grade, group } = modalData;

    setCenters(centers.map(center => {
      if (center.id === centerId) {
        const gradeGroups = center.groupsByGrade[grade] || [];
        let updatedGroups;

        if (group) { // Editing existing group
          updatedGroups = gradeGroups.map(g =>
            g.id === group.id ? { ...g, name: groupName.trim(), days: groupDays, time: groupTime.trim() } : g
          );
        } else { // Adding new group
          const newGroup: Group = {
            id: `g${Date.now()}`,
            name: groupName.trim(),
            days: groupDays,
            time: groupTime.trim()
          };
          updatedGroups = [...gradeGroups, newGroup];
        }

        return {
          ...center,
          groupsByGrade: { ...center.groupsByGrade, [grade]: updatedGroups },
        };
      }
      return center;
    }));

    closeModal();
  };


  const toggleExpand = (centerId: string) => {
    setExpandedCenterId(expandedCenterId === centerId ? null : centerId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">إدارة السناتر</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <form onSubmit={handleAddCenter} className="flex gap-2">
        <input
          type="text"
          value={newCenterName}
          onChange={(e) => setNewCenterName(e.target.value)}
          placeholder="اسم السنتر الجديد"
          className="input-style flex-grow"
        />
        <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2 transition-colors">
          <PlusIcon className="w-5 h-5"/>
          <span>إضافة</span>
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {centers.map((center) => (
          <div key={center.id} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50" onClick={() => toggleExpand(center.id)}>
              <h3 className="font-bold text-lg">{center.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleDeleteCenter(center.id); }} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors" aria-label={`حذف ${center.name}`}>
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {expandedCenterId === center.id && (
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex flex-col gap-4">
                  {GRADES.map(grade => (
                    <div key={grade}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-teal-600 dark:text-teal-400">{grade}</h4>
                         <button onClick={() => openAddModal(center.id, grade)} className="bg-teal-500/80 hover:bg-teal-500 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors inline-flex items-center gap-1">
                            <PlusIcon className="w-3 h-3"/>
                            إضافة مجموعة
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 pl-4">
                        {(center.groupsByGrade[grade] || []).map(group => (
                          <div key={group.id} className="flex justify-between items-center bg-gray-100 dark:bg-slate-700 p-2 rounded-md">
                            <div>
                                <span className="font-semibold">{group.name}</span>
                                <div className="text-xs text-gray-500 dark:text-slate-400">
                                    {group.days && group.days.length > 0 ? group.days.join(', ') : 'لم تحدد الأيام'} - {group.time || 'لم يحدد الوقت'}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button onClick={() => openEditModal(center.id, grade, group)} className="p-1 text-blue-500 hover:text-blue-700" aria-label={`تعديل ${group.name}`}>
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteGroup(center.id, grade, group.id)} className="p-1 text-red-500 hover:text-red-700" aria-label={`حذف ${group.name}`}>
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isGroupModalOpen && modalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center">{modalData.group ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}</h3>
                <form onSubmit={handleSaveGroup} className="flex flex-col gap-4">
                    <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="اسم المجموعة" className="input-style" required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">أيام الحصة</label>
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => handleDayToggle(day)}
                                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${groupDays.includes(day) ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                    <input type="text" value={groupTime} onChange={e => setGroupTime(e.target.value)} placeholder="وقت الحصة (مثال: 5:00 مساءً)" className="input-style" />
                    <div className="flex gap-2 justify-end mt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
      )}
       <style>{`
        .input-style {
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 0.375rem;
            padding: 0.75rem;
            color: #1e293b;
            width: 100%;
        }
        .dark .input-style {
            background-color: #334155;
            border-color: #475569;
            color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default CentersManagement;