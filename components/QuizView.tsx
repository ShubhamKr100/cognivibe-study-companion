
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { processText } from '../utils/accessibilityUtils';
import { ReadingRuler } from './ReadingRuler';

interface QuizViewProps {
  questions: QuizQuestion[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onLoadMore, isLoadingMore }) => {
  const [selections, setSelections] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const { isBionic, isSyllables, isRuler, bgColor, lineHeight } = useAccessibility();
  const isDarkBg = bgColor === '#1e1e1e';
  const textColorClass = isDarkBg ? 'text-slate-200' : 'text-slate-800';

  useEffect(() => {
    setSelections(prev => {
        const newSelections = [...prev];
        for (let i = prev.length; i < questions.length; i++) {
            newSelections.push(-1);
        }
        return newSelections;
    });
  }, [questions]);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (showResults) return; 
    const newSelections = [...selections];
    newSelections[questionIndex] = optionIndex;
    setSelections(newSelections);
  };

  const calculateScore = () => {
    return selections.reduce((score, selection, idx) => {
      if (!questions[idx]) return score;
      return selection === questions[idx].correctAnswerIndex ? score + 1 : score;
    }, 0);
  };

  const allAnswered = selections.length === questions.length && selections.every(s => s !== -1);
  const process = (txt: string) => processText(txt, isBionic, isSyllables);

  return (
    <div 
      className="space-y-8 animate-fade-in pb-10 p-6 rounded-xl transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {isRuler && <ReadingRuler />}

      {questions.map((q, qIdx) => {
        const isSelected = (oIdx: number) => selections[qIdx] === oIdx;

        return (
          <div 
            key={qIdx} 
            className={`rounded-xl border p-6 shadow-sm ${isDarkBg ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <h3 
              className={`text-lg font-semibold mb-4 flex items-start ${textColorClass}`}
              style={{ lineHeight: lineHeight }}
            >
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded mr-2 mt-1 shrink-0">Q{qIdx + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: process(q.question) }} />
            </h3>
            
            <div className="space-y-3">
              {q.options.map((option, oIdx) => {
                let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center ";
                
                if (showResults) {
                  if (oIdx === q.correctAnswerIndex) {
                    btnClass += "border-green-500 bg-green-50 text-green-900 font-medium";
                  } else if (isSelected(oIdx) && oIdx !== q.correctAnswerIndex) {
                    btnClass += "border-red-400 bg-red-50 text-red-900";
                  } else {
                    btnClass += "border-slate-100 text-slate-400 opacity-60";
                  }
                } else {
                  if (isSelected(oIdx)) {
                    btnClass += "border-teal-500 bg-teal-50 text-teal-900 font-medium shadow-md transform scale-[1.01]";
                  } else {
                    btnClass += isDarkBg 
                      ? "border-slate-600 hover:border-teal-400 hover:bg-slate-700 text-slate-300"
                      : "border-slate-100 hover:border-teal-200 hover:bg-slate-50 text-slate-600";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    disabled={showResults}
                    className={btnClass}
                    style={{ lineHeight: lineHeight }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: process(option) }} />
                    {showResults && oIdx === q.correctAnswerIndex && (
                      <svg className="w-5 h-5 text-green-600 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                    {showResults && isSelected(oIdx) && oIdx !== q.correctAnswerIndex && (
                      <svg className="w-5 h-5 text-red-500 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                );
              })}
            </div>

            {showResults && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 border-l-4 border-slate-300">
                <span className="font-semibold block mb-1">Explanation:</span>
                <span dangerouslySetInnerHTML={{ __html: process(q.explanation) }} />
              </div>
            )}
          </div>
        );
      })}

      <div className="sticky bottom-4 z-30 flex flex-col items-center space-y-4">
        {!showResults ? (
          <button
            onClick={() => setShowResults(true)}
            disabled={!allAnswered}
            className={`px-8 py-3 rounded-full font-bold shadow-xl transition-all ${
              allAnswered 
                ? 'bg-slate-800 text-white hover:bg-slate-700 hover:scale-105' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Check Answers
          </button>
        ) : (
           <div className="flex flex-col items-center space-y-3 w-full">
              <div className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center space-x-3">
                 <span className="text-teal-400 text-xl">{calculateScore()} / {questions.length}</span>
                 <span>Correct</span>
              </div>
              
              <button 
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="bg-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-teal-700 transition-colors flex items-center"
              >
                {isLoadingMore ? (
                  <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Load More Questions
                  </>
                )}
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
