import React from 'react';

interface LoadingSpinnerProps {
  mode: 'STORY' | 'QUIZ';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ mode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-teal-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-slate-500 font-medium animate-pulse">
        {mode === 'STORY' ? 'Weaving a story...' : 'Crafting questions...'}
      </p>
    </div>
  );
};
