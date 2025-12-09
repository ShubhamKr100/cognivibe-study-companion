
import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const AccessibilityToolbar: React.FC = () => {
  const { 
    isToolbarOpen, toggleToolbar,
    isBionic, toggleBionic,
    isSyllables, toggleSyllables,
    isRuler, toggleRuler,
    isMicroChunking, toggleMicroChunking,
    isFocusTimer, toggleFocusTimer,
    isZenMode, toggleZenMode,
    bgColor, setBgColor,
    lineHeight, setLineHeight
  } = useAccessibility();

  if (!isToolbarOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up max-h-[80vh] overflow-y-auto">
      <div className="bg-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <h3 className="text-white font-bold flex items-center">
          <span className="text-xl mr-2">♿</span> Access Tools
        </h3>
        <button onClick={toggleToolbar} className="text-slate-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="p-5 space-y-6">
        {/* ADHD Focus Tools Section */}
        <div className="pb-6 border-b border-slate-100">
           <h4 className="text-xs text-indigo-500 font-bold uppercase mb-3 flex items-center">
             <span className="mr-1">🧠</span> ADHD Focus Tools
           </h4>
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium text-sm">Micro-Chunking</span>
                <button 
                  onClick={toggleMicroChunking}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isMicroChunking ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isMicroChunking ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium text-sm">Smart Focus Timer</span>
                <button 
                  onClick={toggleFocusTimer}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isFocusTimer ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isFocusTimer ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium text-sm">Zen Reading Mode</span>
                <button 
                  onClick={toggleZenMode}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isZenMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isZenMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
           </div>
        </div>

        {/* Dyslexia Toggles */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium text-sm">Bionic Reading</span>
            <button 
              onClick={toggleBionic}
              className={`w-10 h-5 rounded-full relative transition-colors ${isBionic ? 'bg-teal-500' : 'bg-slate-300'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isBionic ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium text-sm">Syllable Breakdown</span>
            <button 
              onClick={toggleSyllables}
              className={`w-10 h-5 rounded-full relative transition-colors ${isSyllables ? 'bg-teal-500' : 'bg-slate-300'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isSyllables ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium text-sm">Focus Ruler</span>
            <button 
              onClick={toggleRuler}
              className={`w-10 h-5 rounded-full relative transition-colors ${isRuler ? 'bg-teal-500' : 'bg-slate-300'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isRuler ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Background Tints */}
        <div>
          <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Background Tint</label>
          <div className="flex space-x-3">
            <button 
              onClick={() => setBgColor('#FFFFFF')}
              className={`w-8 h-8 rounded-full border-2 ${bgColor === '#FFFFFF' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200'}`}
              style={{ backgroundColor: '#FFFFFF' }}
              title="Default White"
            />
            <button 
              onClick={() => setBgColor('#FDF5E6')}
              className={`w-8 h-8 rounded-full border-2 ${bgColor === '#FDF5E6' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200'}`}
              style={{ backgroundColor: '#FDF5E6' }}
              title="Soft Cream"
            />
            <button 
              onClick={() => setBgColor('#E6F2FF')}
              className={`w-8 h-8 rounded-full border-2 ${bgColor === '#E6F2FF' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200'}`}
              style={{ backgroundColor: '#E6F2FF' }}
              title="Pale Blue"
            />
            <button 
              onClick={() => setBgColor('#1e1e1e')}
              className={`w-8 h-8 rounded-full border-2 ${bgColor === '#1e1e1e' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-600'}`}
              style={{ backgroundColor: '#1e1e1e' }}
              title="Dark Mode"
            />
          </div>
        </div>

        {/* Line Height */}
        <div>
           <div className="flex justify-between mb-1">
             <label className="text-xs text-slate-500 font-bold uppercase">Line Spacing</label>
             <span className="text-xs text-slate-500">{lineHeight.toFixed(1)}x</span>
           </div>
           <input 
             type="range" 
             min="1.5" 
             max="3.0" 
             step="0.1"
             value={lineHeight}
             onChange={(e) => setLineHeight(parseFloat(e.target.value))}
             className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
           />
        </div>
      </div>
    </div>
  );
};
