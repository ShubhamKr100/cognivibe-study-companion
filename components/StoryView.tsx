
import React, { useState, useEffect } from 'react';
import { VoiceGender } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { processText } from '../utils/accessibilityUtils';
import { ReadingRuler } from './ReadingRuler';

interface StoryViewProps {
  content: string;
  reasoning: string;
  voiceGender: VoiceGender;
}

export const StoryView: React.FC<StoryViewProps> = ({ content, reasoning, voiceGender }) => {
  const [showBrain, setShowBrain] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { isBionic, isSyllables, isRuler, bgColor, lineHeight } = useAccessibility();
  
  // Determine text color based on background
  const isDarkBg = bgColor === '#1e1e1e';
  const textColorClass = isDarkBg ? 'text-slate-200' : 'text-slate-600';
  const headingColorClass = isDarkBg ? 'text-white' : 'text-slate-800';

  // Stop speech if component unmounts or content changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [content, voiceGender]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    
    // Voice selection logic
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;

    if (voiceGender === VoiceGender.MALE) {
      preferredVoice = voices.find(v => 
        v.name.includes("Male") || 
        v.name.includes("David") || 
        v.name.includes("Daniel") ||
        v.name.includes("Google UK English Male")
      );
    } else {
      preferredVoice = voices.find(v => 
        v.name.includes("Female") || 
        v.name.includes("Zira") || 
        v.name.includes("Samantha") || 
        v.name.includes("Google US English")
      );
    }

    if (!preferredVoice) {
      preferredVoice = voices.find(v => !v.name.includes(voiceGender === VoiceGender.MALE ? "Female" : "Male"));
    }

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 0.9; 
    utterance.pitch = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  return (
    <div 
      className="animate-fade-in relative p-6 rounded-xl transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {isRuler && <ReadingRuler />}

      {/* Controls Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4 ${isDarkBg ? 'border-slate-700' : 'border-slate-100'}`}>
        <h2 className={`text-xl font-bold hidden sm:block ${headingColorClass}`}>Concept Narrative</h2>
        
        <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end relative z-50">
          {/* TTS Button */}
          <button 
            onClick={handleSpeak}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
              isSpeaking 
                ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400 ring-opacity-50' 
                : isDarkBg ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
             {isSpeaking ? (
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
             ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
             )}
             <span className="text-sm font-semibold">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          {/* Show Brain Toggle */}
          <div className="flex items-center">
            <span className={`mr-3 text-sm font-medium ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>Show AI Brain</span>
            <button 
              onClick={() => setShowBrain(!showBrain)}
              className="relative inline-flex items-center cursor-pointer focus:outline-none"
            >
              <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${showBrain ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out ${showBrain ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((para, idx) => {
          // 1. Process standard markdown bolding FIRST
          let formattedHtml = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal-600 font-bold">$1</strong>');
          
          // 2. Check for headers
          if (para.startsWith('#') || (para.length < 60 && para.endsWith(':'))) {
             const cleanHeader = para.replace(/^#+\s*/, '');
             return <h3 key={idx} className={`text-2xl font-bold mt-6 mb-3 ${headingColorClass}`}>{cleanHeader}</h3>;
          }

          // 3. Apply accessibility transforms (Bionic/Syllables) if enabled
          // Note: Applying on top of HTML is tricky. For this demo, we apply to non-tag text if possible
          // But simple implementation: strip tags, process, re-insert? 
          // Safer approach for demo: Just process the text content if no bold tags, 
          // or process the whole string assuming Utils handle tags gracefully.
          if (isBionic || isSyllables) {
             formattedHtml = processText(formattedHtml, isBionic, isSyllables);
          }

          return (
            <p 
              key={idx} 
              className={`leading-relaxed mb-4 ${textColorClass}`}
              style={{ lineHeight: lineHeight }}
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
          );
        })}
      </div>

      {/* Reasoning Trace Section */}
      {showBrain && (
        <div className="mt-10 animate-fade-in-up relative z-50">
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
            <div className="bg-slate-800 px-4 py-2 flex items-center border-b border-slate-700">
              <span className="text-lg mr-2">🧠</span>
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">Reasoning Trace</span>
            </div>
            <div className="p-4 sm:p-6 overflow-x-auto">
              <pre className="font-mono text-sm text-teal-50 whitespace-pre-wrap leading-loose">
                {reasoning}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
