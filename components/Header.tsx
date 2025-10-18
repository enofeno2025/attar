
import React from 'react';

interface HeaderProps {
  name: string;
  isDashboard?: boolean;
}

const Header: React.FC<HeaderProps> = ({ name, isDashboard }) => {
  return (
    <header className="bg-teal-500 text-white p-4 shadow-md sticky top-0 z-10">
      {isDashboard ? (
        <div className="text-center">
          <h1 className="font-rubik-extrabold-italic text-4xl font-bold tracking-wide">
            {name}
          </h1>
          <p className="text-lg font-semibold">Second to None</p>
        </div>
      ) : (
        <h1 className="text-xl font-bold text-center tracking-wide">
          {name}
        </h1>
      )}
    </header>
  );
};

export default Header;
