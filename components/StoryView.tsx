
import React, { useState, useEffect, useRef } from 'react';
import { VoiceGender, AppLanguage } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { processText, applyMicroChunking, cleanTextForTTS } from '../utils/accessibilityUtils';
import { ReadingRuler } from './ReadingRuler';
import { getTranslation } from '../utils/translations';

interface StoryViewProps {
  content: string;
  reasoning: string;
  tldr?: string[];
  voiceGender: VoiceGender;
  onUpdateContent?: (content: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  language: AppLanguage;
}

type AudioStatus = 'IDLE' | 'PLAYING' | 'PAUSED';

export const StoryView: React.FC<StoryViewProps> = ({ content, reasoning, tldr, voiceGender, onUpdateContent, onRegenerate, isRegenerating, language }) => {
  const [showBrain, setShowBrain] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('IDLE');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isHighlighterActive, setIsHighlighterActive] = useState(false);
  
  // Ref to hold the current utterance to prevent garbage collection and allow control
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { isBionic, isSyllables, isRuler, isMicroChunking, bgColor, lineHeight, isADHDSupport, isDarkMode } = useAccessibility();
  
  // Determine color scheme
  const isDarkBg = bgColor === '#1e1e1e' || bgColor === '#2d2d2d' || (bgColor === '#ffffff' && isDarkMode === false ? false : bgColor !== '#ffffff' && bgColor !== '#FDF5E6' && bgColor !== '#E6F2FF');

  const textColorClass = isDarkBg ? 'text-slate-200' : 'text-slate-600';
  const headingColorClass = isDarkBg ? 'text-white' : 'text-slate-800';
  const controlBgClass = isDarkBg ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200';
  const iconColorClass = isDarkBg ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100';

  // Cleanup on unmount or content change
  useEffect(() => {
    stopAudio();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [content, voiceGender]);

  // Adjust rate if ADHD support is toggled
  useEffect(() => {
    if (isADHDSupport) {
      setSpeechRate(0.8);
    }
  }, [isADHDSupport]);

  // Handle Highlighting
  const handleMouseUp = () => {
    if (!isHighlighterActive || !contentRef.current || !onUpdateContent) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("mark");
    span.className = "bg-yellow-200 text-slate-900 rounded px-0.5";
    
    try {
        range.surroundContents(span);
        // Clean up empty spans or weird nesting if necessary, then save
        onUpdateContent(contentRef.current.innerHTML);
        selection.removeAllRanges();
    } catch (e) {
        console.log("Highlight failed, likely cross-boundary selection");
    }
  };

  const startSpeaking = (rateOverride?: number) => {
    window.speechSynthesis.cancel();

    const cleanContent = cleanTextForTTS(content);
    const utterance = new SpeechSynthesisUtterance(cleanContent);
    
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

    utterance.rate = rateOverride ?? speechRate;
    utterance.pitch = isADHDSupport ? 0.9 : 1;
    
    utterance.onend = () => {
      setAudioStatus('IDLE');
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setAudioStatus('IDLE');
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setAudioStatus('PLAYING');
  };

  const togglePlayPause = () => {
    if (audioStatus === 'IDLE') {
      startSpeaking();
    } else if (audioStatus === 'PLAYING') {
      window.speechSynthesis.pause();
      setAudioStatus('PAUSED');
    } else if (audioStatus === 'PAUSED') {
      window.speechSynthesis.resume();
      setAudioStatus('PLAYING');
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setAudioStatus('IDLE');
    utteranceRef.current = null;
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setSpeechRate(newRate);
    if (audioStatus === 'PLAYING') {
      startSpeaking(newRate);
    }
  };

  const displayContent = isMicroChunking ? applyMicroChunking(content) : content;
  const paragraphs = displayContent.split('\n').filter(p => p.trim() !== '');

  return (
    <div 
      className="animate-fade-in relative p-6 rounded-xl transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
      onMouseUp={handleMouseUp}
    >
      {isRuler && <ReadingRuler />}

      {/* Controls Header */}
      <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b pb-4 ${isDarkBg ? 'border-slate-700' : 'border-slate-100'}`}>
        <h2 className={`text-xl font-bold hidden sm:block ${headingColorClass}`}>{getTranslation(language, 'conceptNarrative')}</h2>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-between xl:justify-end relative z-50">
          
          {/* Audio Media Player Controls */}
          <div className={`flex items-center space-x-2 p-1.5 rounded-xl border shadow-sm ${controlBgClass}`}>
            <button
              onClick={togglePlayPause}
              disabled={isRegenerating}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                audioStatus === 'PLAYING' 
                  ? 'bg-teal-100 text-teal-700' 
                  : iconColorClass
              } ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={audioStatus === 'PLAYING' ? "Pause" : "Play"}
            >
              {audioStatus === 'PLAYING' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button
              onClick={stopAudio}
              disabled={isRegenerating}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${iconColorClass} ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Stop"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
            </button>
            <div className={`w-px h-6 mx-1 ${isDarkBg ? 'bg-slate-600' : 'bg-slate-200'}`}></div>
            <div className="flex items-center space-x-2 px-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider w-8 text-center ${isDarkBg ? 'text-slate-400' : 'text-slate-500'}`}>
                {speechRate.toFixed(1)}x
              </span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={handleRateChange}
                disabled={isRegenerating}
                className="w-16 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none"
                title="Speaking Pace"
              />
            </div>
            {audioStatus === 'PLAYING' && (
              <div className="flex items-end space-x-0.5 h-4 ml-2 px-1">
                <div className="w-1 bg-teal-500 animate-[bounce_1s_infinite] h-2"></div>
                <div className="w-1 bg-teal-500 animate-[bounce_1.2s_infinite] h-4"></div>
                <div className="w-1 bg-teal-500 animate-[bounce_0.8s_infinite] h-3"></div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Regenerate Button */}
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${iconColorClass} ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={getTranslation(language, 'regenerate')}
            >
                <svg className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-teal-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>

            {/* Highlighter Toggle */}
            <button
              onClick={() => setIsHighlighterActive(!isHighlighterActive)}
              disabled={isRegenerating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isHighlighterActive ? 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-200' : 'bg-slate-200 text-slate-500'} ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Highlighter Tool"
            >
               🖍️
            </button>
            
            <span className={`mr-2 text-sm font-medium hidden sm:block ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>{getTranslation(language, 'aiBrain')}</span>
            <button 
              onClick={() => setShowBrain(!showBrain)}
              disabled={isRegenerating}
              className={`relative inline-flex items-center cursor-pointer focus:outline-none group ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Toggle Reasoning Trace"
            >
              <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${showBrain ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out ${showBrain ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {isRegenerating ? (
        <div className="space-y-6 mt-8 animate-pulse">
            {/* TLDR Skeleton */}
            <div className="border border-amber-100 bg-amber-50/50 rounded-lg p-4">
                <div className="h-3 bg-amber-200 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-amber-100 rounded w-full"></div>
                    <div className="h-3 bg-amber-100 rounded w-5/6"></div>
                    <div className="h-3 bg-amber-100 rounded w-4/6"></div>
                </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div className="flex justify-center mt-8">
                <span className="text-teal-600 font-medium animate-bounce">{getTranslation(language, 'weavingStory')}</span>
            </div>
        </div>
      ) : (
        <>
            {/* TL;DR Cheat Sheet */}
            {tldr && tldr.length > 0 && (
                <div className="mb-8 relative group animate-fade-in-up">
                <div className="absolute -top-3 -left-2 text-2xl z-10 filter drop-shadow-md transform -rotate-12">📌</div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                    <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">{getTranslation(language, 'cheatSheet')}</h3>
                    <ul className="space-y-1.5">
                        {tldr.map((fact, i) => (
                        <li key={i} className="flex items-start text-sm font-semibold text-slate-800">
                            <span className="mr-2 text-amber-500">•</span>
                            {fact}
                        </li>
                        ))}
                    </ul>
                </div>
                </div>
            )}

            {/* Story Content */}
            <div 
                ref={contentRef}
                className="prose prose-lg max-w-none break-words"
            >
                {paragraphs.map((para, idx) => {
                let formattedHtml = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal-600 font-bold">$1</strong>');
                
                if (para.startsWith('#') || (para.length < 60 && para.endsWith(':'))) {
                    const cleanHeader = para.replace(/^#+\s*/, '');
                    return <h3 key={idx} className={`text-2xl font-bold mt-6 mb-3 ${headingColorClass}`}>{cleanHeader}</h3>;
                }

                if (isBionic || isSyllables) {
                    formattedHtml = processText(formattedHtml, isBionic, isSyllables);
                }

                const isBullet = para.trim().startsWith('•');
                
                return (
                    <p 
                    key={idx} 
                    className={`leading-relaxed ${isBullet ? 'pl-4 border-l-2 border-teal-200 ml-2 mb-3' : 'mb-4'} ${textColorClass}`}
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
                    <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">{getTranslation(language, 'reasoningTrace')}</span>
                    </div>
                    <div className="p-4 sm:p-6 overflow-x-auto">
                    <pre className="font-mono text-sm text-teal-50 whitespace-pre-wrap leading-loose break-words">
                        {reasoning}
                    </pre>
                    </div>
                </div>
                </div>
            )}
        </>
      )}
    </div>
  );
};
