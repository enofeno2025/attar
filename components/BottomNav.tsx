import React from 'react';
import { SettingsIcon, UserIcon, BellIcon, HomeIcon } from './Icons';
import type { View } from '../types';

interface BottomNavProps {
  onNavigate: (view: View) => void;
  currentView: View;
}

const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, currentView }) => {

  const navItems: { view: View, label: string, icon: React.FC<{className?: string}> }[] = [
    { view: 'settings', label: 'اعدادات', icon: SettingsIcon },
    { view: 'student-registry', label: 'سجل طالب', icon: UserIcon },
    { view: 'reminders', label: 'تذكر', icon: BellIcon },
    { view: 'dashboard', label: 'الرئيسية', icon: HomeIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-slate-700">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = item.view === currentView;

          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center w-24 gap-1 text-center transition-transform duration-300 ease-in-out ${isActive ? '-translate-y-3' : ''}`}
              aria-label={item.label}
            >
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-300 ease-in-out ${
                  isActive ? 'w-14 h-14 bg-teal-500 shadow-lg' : 'w-10 h-10'
                }`}
              >
                <item.icon
                  className={`transition-colors duration-200 ${
                    isActive ? 'w-7 h-7 text-white' : 'w-6 h-6 text-gray-500 dark:text-gray-400'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-semibold transition-colors duration-300 ${
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;