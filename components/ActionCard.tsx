
import React from 'react';

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-teal-500 rounded-lg p-2 flex flex-col items-center justify-center aspect-square gap-1 hover:bg-teal-600 active:bg-teal-700 transition-all duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      <Icon className="w-12 h-12 text-white" />
      <span className="text-white font-semibold text-center text-lg leading-tight">{label}</span>
    </button>
  );
};

export default ActionCard;