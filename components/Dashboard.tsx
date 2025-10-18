import React from 'react';
import { ACTION_ITEMS } from '../constants';
import type { View } from '../types';
import ActionCard from './ActionCard';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {ACTION_ITEMS.map((item) => (
        <ActionCard
          key={item.id}
          icon={item.icon}
          label={item.label}
          onClick={() => onNavigate(item.id as View)}
        />
      ))}
    </div>
  );
};

export default Dashboard;
