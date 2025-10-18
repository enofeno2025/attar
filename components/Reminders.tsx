import React, { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, BellIcon, CheckIcon } from './Icons';

interface RemindersProps {
  onBack: () => void;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
}

const Reminders: React.FC<RemindersProps> = ({ onBack, reminders, setReminders }) => {
  const [newText, setNewText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);
  
  const scheduleNotification = (reminder: Reminder) => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !reminder.dueDate) {
      return;
    }

    const dueDate = new Date(reminder.dueDate);
    const timeUntilDue = dueDate.getTime() - Date.now();

    if (timeUntilDue > 0) {
      setTimeout(() => {
        new Notification('تذكير بمهمة', {
          body: reminder.text,
          icon: '/vite.svg', // Using app icon
        });
      }, timeUntilDue);
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      const newReminder: Reminder = {
        id: `r${Date.now()}`,
        text: newText.trim(),
        completed: false,
        dueDate: newDueDate || null,
      };
      setReminders(prev => [...prev, newReminder]);
      if (newReminder.dueDate) {
        scheduleNotification(newReminder);
      }
      setNewText('');
      setNewDueDate('');
    }
  };

  const handleToggleComplete = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };
  
  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };
  
  const activeReminders = reminders.filter(r => !r.completed).sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : a.dueDate ? -1 : b.dueDate ? 1 : 0);
  const completedReminders = reminders.filter(r => r.completed).sort((a,b) => (a.dueDate && b.dueDate) ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime() : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">قائمة المهام والتذكيرات</h2>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="العودة">
          <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      </div>

      <form onSubmit={handleAddReminder} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col gap-3 shadow-sm border border-gray-200 dark:border-slate-700">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="مهمة جديدة..."
          className="input-style"
          required
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="input-style flex-grow"
            title="تحديد وقت للتذكير"
          />
          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold p-3 rounded-md inline-flex items-center justify-center transition-colors" aria-label="إضافة مهمة">
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
      
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">المهام القادمة</h3>
        {activeReminders.length > 0 ? (
          activeReminders.map(reminder => (
            <ReminderItem key={reminder.id} reminder={reminder} onToggle={handleToggleComplete} onDelete={handleDeleteReminder} />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-4 rounded-lg">لا توجد مهام قادمة.</p>
        )}
      </div>

      {completedReminders.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">المهام المكتملة</h3>
          {completedReminders.map(reminder => (
            <ReminderItem key={reminder.id} reminder={reminder} onToggle={handleToggleComplete} onDelete={handleDeleteReminder} />
          ))}
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
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
        }
        .dark input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }
      `}</style>
    </div>
  );
};


const ReminderItem: React.FC<{
    reminder: Reminder;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ reminder, onToggle, onDelete }) => {
  const isPastDue = reminder.dueDate && !reminder.completed && new Date(reminder.dueDate) < new Date();
  
  return (
    <div className={`flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm transition-all ${reminder.completed ? 'opacity-60' : ''}`}>
      <button onClick={() => onToggle(reminder.id)} className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${reminder.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-300 dark:border-slate-600 hover:border-teal-400'}`}>
        {reminder.completed && <CheckIcon className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-grow">
        <p className={`text-slate-800 dark:text-slate-200 ${reminder.completed ? 'line-through' : ''}`}>{reminder.text}</p>
        {reminder.dueDate && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${isPastDue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>
            <BellIcon className="w-3 h-3" />
            <span>{new Date(reminder.dueDate).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>
        )}
      </div>
      <button onClick={() => onDelete(reminder.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors" aria-label="حذف المهمة">
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Reminders;
