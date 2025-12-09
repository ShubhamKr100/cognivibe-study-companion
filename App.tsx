
import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryView } from './components/StoryView';
import { QuizView } from './components/QuizView';
import { MindMapView } from './components/MindMapView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChatInterface } from './components/ChatInterface';
import { generateStory, generateQuiz, generateMindMap, generateChatResponse } from './services/geminiService';
import { AppMode, AnalysisState, AppLanguage, ExplanationStyle, VoiceGender, ChatMessage, UserInterest, SoundscapeType } from './types';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { FocusTimer } from './components/FocusTimer';
import { SoundscapePlayer } from './components/SoundscapePlayer';
import { getTranslation } from './utils/translations';

// Main App Layout Component
const AppContent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppMode>(AppMode.STORY);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMoreQuizLoading, setIsMoreQuizLoading] = useState<boolean>(false);
  const [isRegeneratingStory, setIsRegeneratingStory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [language, setLanguage] = useState<AppLanguage>(AppLanguage.ENGLISH);
  const [style, setStyle] = useState<ExplanationStyle>(ExplanationStyle.STORY_FORMAT);
  const [interest, setInterest] = useState<UserInterest>(UserInterest.GENERAL);
  const [voice, setVoice] = useState<VoiceGender>(VoiceGender.FEMALE);
  
  // Soundscape State
  const [soundscape, setSoundscape] = useState<SoundscapeType>(SoundscapeType.OFF);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Data Persistence State
  const [data, setData] = useState<AnalysisState>({
    story: null,
    quiz: null,
    mindMap: null
  });

  const { isToolbarOpen, toggleToolbar, isZenMode, isFocusTimer, isDarkMode, toggleTheme, isADHDSupport, isDyslexicFont } = useAccessibility();

  useEffect(() => {
    if (!image) return;

    const fetchData = async () => {
      setError(null);
      setIsLoading(true);

      try {
        if (activeTab === AppMode.STORY) {
            if (!data.story) {
               const storyData = await generateStory(image, language, style, interest, isADHDSupport);
               setData(prev => ({ ...prev, story: storyData }));
            }
        } else if (activeTab === AppMode.QUIZ) {
            if (!data.quiz) {
                const quiz = await generateQuiz(image, language);
                setData(prev => ({ ...prev, quiz }));
            }
        } else if (activeTab === AppMode.MINDMAP) {
            if (!data.mindMap) {
                const mindMap = await generateMindMap(image, language);
                setData(prev => ({ ...prev, mindMap }));
            }
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === AppMode.STORY && !data.story) fetchData();
    else if (activeTab === AppMode.QUIZ && !data.quiz) fetchData();
    else if (activeTab === AppMode.MINDMAP && !data.mindMap) fetchData();

  }, [image, activeTab, language, style, interest, data.story, data.quiz, data.mindMap, isADHDSupport]); 

  useEffect(() => {
     if (image) {
         setData({ story: null, quiz: null, mindMap: null });
         setChatHistory([]);
     }
  }, [language, style, interest]);


  const handleImageUpload = (base64: string) => {
    setImage(base64);
    setData({ story: null, quiz: null, mindMap: null });
    setChatHistory([]);
    setActiveTab(AppMode.STORY);
  };

  const handleClear = () => {
    setImage(null);
    setData({ story: null, quiz: null, mindMap: null });
    setChatHistory([]);
    setError(null);
  };

  const handleRegenerateStory = async () => {
    if (!image) return;
    setIsRegeneratingStory(true);
    try {
      const storyData = await generateStory(image, language, style, interest, isADHDSupport);
      setData(prev => ({ ...prev, story: storyData }));
    } catch (err: any) {
       console.error("Regeneration failed", err);
       setError(err.message || "Failed to regenerate story.");
    } finally {
      setIsRegeneratingStory(false);
    }
  };

  const handleLoadMoreQuiz = async () => {
    if (!image) return;
    
    // 1. HARD RESET: Clear current quiz data effectively unmounting the QuizView
    setData(prev => ({ ...prev, quiz: null }));
    setIsMoreQuizLoading(true);
    
    // 2. Fetch New Data
    try {
        const newQuestions = await generateQuiz(image, language);
        setData(prev => ({ ...prev, quiz: newQuestions }));
    } catch (err) {
        console.error("Failed to load more questions", err);
    } finally {
        setIsMoreQuizLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!image) return;
    
    const newUserMsg: ChatMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, newUserMsg]);
    setIsChatSending(true);

    try {
      const responseText = await generateChatResponse(image, chatHistory, text, language);
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setIsChatSending(false);
    }
  };

  const updateStoryContent = (newContent: string) => {
      setData(prev => ({
          ...prev,
          story: prev.story ? { ...prev.story, content: newContent } : null
      }));
  };

  const handleDownloadNotes = () => {
    if (!data.story && !data.quiz) return;

    let content = `COGNIVIBE STUDY NOTES\nDate: ${new Date().toLocaleDateString()}\n\n`;

    if (data.story) {
      content += `--- TL;DR ---\n`;
      data.story.tldr.forEach(p => content += `• ${p}\n`);
      content += `\n`;
      content += `--- STORY MODE: ${style} (${interest}) ---\n\n`;
      const textContent = data.story.content.replace(/<[^>]*>?/gm, '');
      content += `${textContent}\n\n`;
    }

    if (data.quiz && data.quiz.length > 0) {
      content += `--- QUIZ QUESTIONS ---\n\n`;
      data.quiz.forEach((q, idx) => {
        content += `${idx + 1}. ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          content += `   ${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
        });
        content += `   Answer: ${String.fromCharCode(65 + q.correctAnswerIndex)}\n`;
        content += `   Explanation: ${q.explanation}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CogniVibe_Notes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const appBgClass = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-[#f3f4f6]';
  const textClass = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const panelBgClass = isDarkMode ? 'bg-[#2d2d2d]' : 'bg-white';
  const headerBgClass = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';

  return (
    <div className={`min-h-screen flex flex-col font-inter transition-colors duration-300 ${appBgClass} ${textClass}`}>
      <AccessibilityToolbar />
      <SoundscapePlayer type={soundscape} />
      {isFocusTimer && <FocusTimer />}
      
      {/* Header */}
      <header className={`${headerBgClass} ${borderClass} border-b sticky top-0 z-40 shadow-sm transition-all duration-300 ${isZenMode ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'h-16 opacity-100'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-teal-500/30 shadow-md">C</div>
            <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>CogniVibe</h1>
          </div>
          
          <div className="flex items-center space-x-4">
             {/* Soundscape Dropdown */}
             <div className="relative group">
                <button className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                   <span>🎧</span>
                   <span className="text-sm font-medium">{getTranslation(language, 'focusMode')}</span>
                </button>
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden hidden group-hover:block ${isDarkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-slate-100'}`}>
                   <button onClick={() => setSoundscape(SoundscapeType.OFF)} className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-500 hover:text-white ${soundscape === SoundscapeType.OFF ? 'bg-teal-500/10 text-teal-500' : ''}`}>🔇 Off</button>
                   <button onClick={() => setSoundscape(SoundscapeType.BROWN_NOISE)} className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-500 hover:text-white ${soundscape === SoundscapeType.BROWN_NOISE ? 'bg-teal-500/10 text-teal-500' : ''}`}>🟤 Brown Noise</button>
                   <button onClick={() => setSoundscape(SoundscapeType.RAIN)} className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-500 hover:text-white ${soundscape === SoundscapeType.RAIN ? 'bg-teal-500/10 text-teal-500' : ''}`}>🌧️ Rain</button>
                </div>
             </div>

             <button 
               onClick={toggleTheme}
               className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               {isDarkMode ? '☀️' : '🌙'}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-500 ${isZenMode ? 'max-w-4xl flex items-center justify-center' : 'max-w-[1600px]'}`}>
        
        {/* Controls Toolbar */}
        <div className={`${panelBgClass} ${borderClass} p-4 rounded-xl border shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between transition-all duration-300 ${isZenMode ? 'hidden' : 'block'}`}>
            <div className="flex flex-wrap gap-4 items-center">
              {/* Language Dropdown */}
              <div className="flex flex-col">
                  <label className={`text-xs font-semibold mb-1 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{getTranslation(language, 'language')}</label>
                  <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                      className={`text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 min-w-[100px] transition-colors ${isDarkMode ? 'bg-[#3d3d3d] border-gray-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  >
                      {Object.values(AppLanguage).map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                      ))}
                  </select>
              </div>

              {/* Style Dropdown */}
              <div className="flex flex-col">
                  <label className={`text-xs font-semibold mb-1 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{getTranslation(language, 'style')}</label>
                  <select 
                      value={style}
                      onChange={(e) => setStyle(e.target.value as ExplanationStyle)}
                      className={`text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 min-w-[140px] transition-colors ${isDarkMode ? 'bg-[#3d3d3d] border-gray-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  >
                      {Object.values(ExplanationStyle).map((s) => (
                          <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
              </div>

              {/* Interest / Analogy Dropdown */}
              <div className="flex flex-col">
                  <label className="text-xs text-teal-500 font-bold mb-1 ml-1">{getTranslation(language, 'interest')} 🌟</label>
                  <select 
                      value={interest}
                      onChange={(e) => setInterest(e.target.value as UserInterest)}
                      className={`text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 font-medium min-w-[160px] transition-colors ${isDarkMode ? 'bg-teal-900/30 border-teal-800 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-900'}`}
                  >
                      {Object.values(UserInterest).map((i) => (
                          <option key={i} value={i}>{i}</option>
                      ))}
                  </select>
              </div>

              {/* Voice Dropdown */}
              <div className="flex flex-col">
                  <label className={`text-xs font-semibold mb-1 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{getTranslation(language, 'voice')}</label>
                  <select 
                      value={voice}
                      onChange={(e) => setVoice(e.target.value as VoiceGender)}
                      className={`text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 min-w-[100px] transition-colors ${isDarkMode ? 'bg-[#3d3d3d] border-gray-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  >
                      {Object.values(VoiceGender).map((v) => (
                          <option key={v} value={v}>{v}</option>
                      ))}
                  </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
               {/* Download Notes */}
               <button 
                 onClick={handleDownloadNotes}
                 disabled={!data.story && !data.quiz}
                 className={`flex items-center space-x-2 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-teal-400' : 'text-slate-600 hover:text-teal-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                 title={getTranslation(language, 'saveNotes')}
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 <span className="text-sm font-medium hidden sm:inline">{getTranslation(language, 'saveNotes')}</span>
               </button>
            </div>
        </div>

        <div className={`flex gap-6 min-h-[600px] transition-all duration-500 ${isZenMode ? 'flex-col justify-center' : 'flex-col lg:flex-row h-[calc(100vh-250px)]'}`}>
          {/* Left Panel: Upload Zone */}
          <div className={`lg:w-1/2 flex flex-col h-full transition-all duration-500 ${isZenMode ? 'hidden' : 'block'}`}>
            <ImageUploader 
              image={image} 
              onImageUpload={handleImageUpload} 
              onClear={handleClear} 
              isThinking={isLoading}
              language={language}
            />
          </div>

          {/* Right Panel: Knowledge Display */}
          <div className={`flex flex-col rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${panelBgClass} ${borderClass} ${isDyslexicFont ? 'font-dyslexic' : ''} ${isZenMode ? 'w-full shadow-2xl scale-105 z-50 h-[80vh]' : 'lg:w-1/2 h-full'}`}>
            {/* Tabs */}
            <div className={`flex border-b flex-none ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
              <button
                onClick={() => setActiveTab(AppMode.STORY)}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === AppMode.STORY
                    ? `text-teal-500 border-b-2 border-teal-500 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50/50'}`
                    : `${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`
                }`}
              >
                {getTranslation(language, 'storyMode')}
              </button>
              <button
                onClick={() => setActiveTab(AppMode.QUIZ)}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === AppMode.QUIZ
                    ? `text-teal-500 border-b-2 border-teal-500 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50/50'}`
                    : `${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`
                }`}
              >
                {getTranslation(language, 'quizMode')}
              </button>
              <button
                onClick={() => setActiveTab(AppMode.MINDMAP)}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === AppMode.MINDMAP
                    ? `text-teal-500 border-b-2 border-teal-500 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50/50'}`
                    : `${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`
                }`}
              >
                {getTranslation(language, 'mindMap')}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              {!image ? (
                <div className={`flex flex-col items-center justify-center h-full space-y-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <p className="text-lg">Upload an image to start learning</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p>{error}</p>
                   <button onClick={() => window.location.reload()} className="text-sm underline">Try refreshing</button>
                </div>
              ) : isLoading || isMoreQuizLoading || (activeTab === AppMode.QUIZ && !data.quiz) || (activeTab === AppMode.MINDMAP && !data.mindMap) ? (
                <LoadingSpinner mode={activeTab === AppMode.MINDMAP ? 'STORY' : activeTab} language={language} />
              ) : (
                <>
                  {activeTab === AppMode.STORY && data.story && (
                    <StoryView 
                      content={data.story.content} 
                      reasoning={data.story.reasoning} 
                      tldr={data.story.tldr}
                      voiceGender={voice}
                      onUpdateContent={updateStoryContent}
                      onRegenerate={handleRegenerateStory}
                      isRegenerating={isRegeneratingStory}
                      language={language}
                    />
                  )}
                  {activeTab === AppMode.QUIZ && data.quiz && (
                    <QuizView 
                      questions={data.quiz} 
                      onLoadMore={handleLoadMoreQuiz}
                      isLoadingMore={isMoreQuizLoading}
                      language={language}
                    />
                  )}
                  {activeTab === AppMode.MINDMAP && data.mindMap && (
                    <MindMapView data={data.mindMap} language={language} />
                  )}
                </>
              )}
            </div>

            {/* Chat Interface */}
            {image && !isLoading && !error && !isZenMode && (
               <div className="flex-none z-10">
                 <ChatInterface 
                   messages={chatHistory} 
                   onSendMessage={handleSendMessage}
                   isSending={isChatSending}
                 />
               </div>
            )}
          </div>
        </div>

        {/* Accessibility FAB */}
        <button 
          onClick={toggleToolbar}
          className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all z-50 flex items-center gap-2 hover:scale-105"
          title={getTranslation(language, 'tools')}
        >
           <span className="text-2xl">♿</span>
           <span className="font-semibold pr-1 hidden group-hover:block">{getTranslation(language, 'tools')}</span>
        </button>

      </main>
    </div>
  );
};

// Wrap App with Provider
function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}

export default App;
