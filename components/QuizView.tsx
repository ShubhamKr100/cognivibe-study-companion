
import React, { useState, useEffect } from 'react';
import { QuizQuestion, AppLanguage } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { processText } from '../utils/accessibilityUtils';
import { ReadingRuler } from './ReadingRuler';
import { getTranslation } from '../utils/translations';

interface QuizViewProps {
  questions: QuizQuestion[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  language: AppLanguage;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onLoadMore, isLoadingMore, language }) => {
  // 1. STRICT STATE MANAGEMENT
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const { isBionic, isSyllables, isRuler, bgColor, lineHeight, isDarkMode } = useAccessibility();
  
  // Determine color scheme
  const isDarkBg = bgColor === '#1e1e1e' || bgColor === '#2d2d2d' || (bgColor === '#ffffff' && isDarkMode === false ? false : bgColor !== '#ffffff' && bgColor !== '#FDF5E6' && bgColor !== '#E6F2FF');
  const textColorClass = isDarkBg ? 'text-slate-200' : 'text-slate-800';
  const cardBgClass = isDarkBg ? 'bg-[#363636] border-slate-700' : 'bg-white border-slate-200';

  // 2. FORCE RESET EFFECT (Watches for new questions)
  useEffect(() => {
    // Hard Reset of all local state when questions prop updates
    setQuizScore(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setShowCelebration(false);
  }, [questions]);

  // 3. CELEBRATION EFFECT (Watches Score)
  useEffect(() => {
    // Only trigger if finished, score is perfect, and we have questions
    if (quizFinished && questions.length > 0 && quizScore === questions.length) {
      triggerCelebration();
    }
  }, [quizScore, quizFinished, questions.length]);

  const triggerCelebration = () => {
    // A. Audio Logic using Constructor
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.warn("Audio autoplay blocked", e));
    } catch (e) {
      console.warn("Audio playback failed");
    }

    // B. Confetti Logic
    // @ts-ignore
    if (typeof window.confetti === 'function') {
      // @ts-ignore
      window.confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 },
        zIndex: 100 
      });
    }

    // C. Modal Logic
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    if (quizFinished) return; // Prevent changing answers after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: oIdx
    }));
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    
    // Update state strictly
    setQuizScore(score);
    setQuizFinished(true);
  };

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;
  const process = (txt: string) => processText(txt, isBionic, isSyllables);

  return (
    <div 
      className="space-y-8 animate-fade-in pb-10 p-6 rounded-xl transition-colors duration-300 relative"
      style={{ backgroundColor: bgColor }}
    >
      {isRuler && <ReadingRuler />}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
           <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 transform animate-bounce flex flex-col items-center">
              <span className="text-6xl mb-4">🏆</span>
              <h2 className="text-3xl font-extrabold text-slate-800 text-center">{getTranslation(language, 'outstanding')}</h2>
              <p className="text-slate-600 font-medium mt-2">{getTranslation(language, 'mastered')}</p>
           </div>
        </div>
      )}

      {/* Questions Loop */}
      {questions.map((q, qIdx) => {
        const selectedOpt = selectedAnswers[qIdx];
        const isSelected = (oIdx: number) => selectedOpt === oIdx;

        return (
          <div 
            key={qIdx} 
            className={`rounded-xl border p-6 shadow-sm ${cardBgClass}`}
          >
            <h3 
              className={`text-lg font-semibold mb-4 flex items-start ${textColorClass} break-words`}
              style={{ lineHeight: lineHeight }}
            >
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded mr-2 mt-1 shrink-0">Q{qIdx + 1}</span>
              <span className="break-words" dangerouslySetInnerHTML={{ __html: process(q.question) }} />
            </h3>
            
            <div className="space-y-3">
              {q.options.map((option, oIdx) => {
                let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center ";
                
                if (quizFinished) {
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
                    onClick={() => handleOptionSelect(qIdx, oIdx)}
                    disabled={quizFinished}
                    className={btnClass}
                    style={{ lineHeight: lineHeight }}
                  >
                    <span className="break-words" dangerouslySetInnerHTML={{ __html: process(option) }} />
                    {quizFinished && oIdx === q.correctAnswerIndex && (
                      <svg className="w-5 h-5 text-green-600 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                    {quizFinished && isSelected(oIdx) && oIdx !== q.correctAnswerIndex && (
                      <svg className="w-5 h-5 text-red-500 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation - Only show after finish */}
            {quizFinished && (
              <div className={`mt-4 p-4 rounded-lg text-sm border-l-4 ${isDarkBg ? 'bg-slate-700 text-slate-300 border-slate-500' : 'bg-slate-50 text-slate-700 border-slate-300'}`}>
                <span className="font-semibold block mb-1">{getTranslation(language, 'explanation')}:</span>
                <span className="break-words" dangerouslySetInnerHTML={{ __html: process(q.explanation) }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Action Area */}
      <div className="sticky bottom-4 z-30 flex flex-col items-center space-y-4">
        {!quizFinished ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`px-8 py-3 rounded-full font-bold shadow-xl transition-all ${
              allAnswered 
                ? 'bg-slate-800 text-white hover:bg-slate-700 hover:scale-105' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {getTranslation(language, 'checkAnswers')}
          </button>
        ) : (
           <div className="flex flex-col items-center space-y-3 w-full animate-fade-in-up">
              {/* Score Display (Relative to total) */}
              <div className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center space-x-3 border-2 border-slate-700">
                 <span className={`${quizScore === questions.length ? 'text-yellow-400' : 'text-teal-400'} text-xl`}>
                    {getTranslation(language, 'score')}: {quizScore} / {questions.length}
                 </span>
                 {quizScore === questions.length && <span>🎉</span>}
              </div>
              
              <button 
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="bg-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-teal-700 transition-colors flex items-center"
              >
                {isLoadingMore ? (
                  <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     {getTranslation(language, 'preparingQuiz')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    {getTranslation(language, 'loadMore')}
                  </>
                )}
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
