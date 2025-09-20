
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">
          Parenting Wellness Hub
        </h1>
        <p className="text-slate-500">Your AI-powered parenting companion</p>
      </div>
    </header>
  );
};

export default Header;
