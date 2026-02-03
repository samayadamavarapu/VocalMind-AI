
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">VocalMind <span className="text-indigo-600">AI</span></h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-sm font-medium text-slate-500">Record. Analyze. Execute.</span>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Settings</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
