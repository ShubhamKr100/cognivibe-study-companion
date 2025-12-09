
import React, { useState, useEffect, useRef } from 'react';

const FOCUS_TIME = 10 * 60; // 10 minutes
const BREAK_TIME = 2 * 60;  // 2 minutes

export const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [showNotification, setShowNotification] = useState(false);

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for simple beep
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    // Play sound
    audioRef.current?.play().catch(() => {});
    
    // Show notification
    setShowNotification(true);
    
    // Switch modes automatically for the next start
    if (mode === 'FOCUS') {
      setMode('BREAK');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('FOCUS');
      setTimeLeft(FOCUS_TIME);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Progress calculation for SVG circle
  const totalTime = mode === 'FOCUS' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed bottom-32 left-6 z-50 animate-fade-in-up">
      <div className={`relative bg-white rounded-full p-2 shadow-2xl border-4 ${mode === 'FOCUS' ? 'border-teal-500' : 'border-indigo-400'} flex items-center justify-center w-24 h-24`}>
        {/* Progress Ring */}
        <svg className="absolute w-full h-full transform -rotate-90 p-1">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${mode === 'FOCUS' ? 'text-teal-500' : 'text-indigo-500'} transition-all duration-1000 ease-linear`}
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-xl font-bold font-mono text-slate-700">
            {formatTime(timeLeft)}
          </span>
          <button 
            onClick={toggleTimer}
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-teal-600 mt-1"
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
        </div>

        {/* Floating Notification */}
        {showNotification && (
          <div className="absolute left-28 bg-slate-800 text-white p-4 rounded-xl w-64 shadow-xl animate-bounce">
             <div className="flex justify-between items-start">
               <div>
                  <h4 className="font-bold text-teal-400">Time's Up!</h4>
                  <p className="text-sm mt-1">
                    {mode === 'BREAK' 
                      ? "Great focus session! Take a brain break." 
                      : "Break over! Ready to focus again?"}
                  </p>
               </div>
               <button onClick={() => setShowNotification(false)} className="text-slate-400 hover:text-white">✕</button>
             </div>
          </div>
        )}
      </div>
      <div className="text-center mt-2 bg-black/70 text-white text-[10px] rounded-full px-2 py-0.5 backdrop-blur-sm">
        {mode} MODE
      </div>
    </div>
  );
};
