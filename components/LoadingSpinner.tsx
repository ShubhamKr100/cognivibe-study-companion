
import React from 'react';
import { AppLanguage } from '../types';
import { getTranslation } from '../utils/translations';

interface LoadingSpinnerProps {
  mode: 'STORY' | 'QUIZ';
  language: AppLanguage;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ mode, language }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-teal-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-slate-500 font-medium animate-pulse">
        {mode === 'STORY' ? getTranslation(language, 'weavingStory') : getTranslation(language, 'craftingQuestions')}
      </p>
    </div>
  );
};
