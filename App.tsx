
import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryView } from './components/StoryView';
import { QuizView } from './components/QuizView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChatInterface } from './components/ChatInterface';
import { generateStory, generateQuiz, generateChatResponse } from './services/geminiService';
import { AppMode, AnalysisState, AppLanguage, ExplanationStyle, VoiceGender, ChatMessage, UserInterest } from './types';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';

// Main App Layout Component
const AppContent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppMode>(AppMode.STORY);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMoreQuizLoading, setIsMoreQuizLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [language, setLanguage] = useState<AppLanguage>(AppLanguage.ENGLISH);
  const [style, setStyle] = useState<ExplanationStyle>(ExplanationStyle.STORY_FORMAT);
  const [interest, setInterest] = useState<UserInterest>(UserInterest.GENERAL);
  const [voice, setVoice] = useState<VoiceGender>(VoiceGender.FEMALE);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  const [data, setData] = useState<AnalysisState>({
    story: null,
    quiz: null
  });

  const { isToolbarOpen, toggleToolbar } = useAccessibility();

  useEffect(() => {
    if (!image) return;

    const fetchData = async () => {
      setError(null);
      setIsLoading(true);

      try {
        if (activeTab === AppMode.STORY) {
            const storyData = await generateStory(image, language, style, interest);
            setData(prev => ({ ...prev, story: storyData }));
        } else if (activeTab === AppMode.QUIZ) {
            if (!data.quiz) {
                const quiz = await generateQuiz(image, language);
                setData(prev => ({ ...prev, quiz }));
            }
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === AppMode.STORY) {
        fetchData();
    } else if (activeTab === AppMode.QUIZ && !data.quiz) {
        fetchData(); 
    } 

  }, [image, activeTab, language, style, interest]); 

  const handleImageUpload = (base64: string) => {
    setImage(base64);
    setData({ story: null, quiz: null });
    setChatHistory([]);
    setActiveTab(AppMode.STORY);
  };

  const handleClear = () => {
    setImage(null);
    setData({ story: null, quiz: null });
    setChatHistory([]);
    setError(null);
  };

  const handleLoadMoreQuiz = async () => {
    if (!image) return;
    setIsMoreQuizLoading(true);
    try {
        const newQuestions = await generateQuiz(image, language);
        setData(prev => ({
            ...prev,
            quiz: [...(prev.quiz || []), ...newQuestions]
        }));
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

  const handleDownloadNotes = () => {
    if (!data.story && !data.quiz) return;

    let content = `COGNIVIBE STUDY NOTES\nDate: ${new Date().toLocaleDateString()}\n\n`;

    if (data.story) {
      content += `--- STORY MODE: ${style} (${interest}) ---\n\n`;
      content += `${data.story.content}\n\n`;
      content += `--- REASONING TRACE ---\n\n`;
      content += `${data.story.reasoning}\n\n`;
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <AccessibilityToolbar />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-teal-200 shadow-md">C</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">CogniVibe</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Multimodal Study Companion
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Controls Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Language Dropdown */}
              <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-semibold mb-1 ml-1">Language</label>
                  <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 min-w-[100px]"
                  >
                      {Object.values(AppLanguage).map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                      ))}
                  </select>
              </div>

              {/* Style Dropdown */}
              <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-semibold mb-1 ml-1">Explanation Style</label>
                  <select 
                      value={style}
                      onChange={(e) => setStyle(e.target.value as ExplanationStyle)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 min-w-[140px]"
                  >
                      {Object.values(ExplanationStyle).map((s) => (
                          <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
              </div>

              {/* Interest / Analogy Dropdown */}
              <div className="flex flex-col">
                  <label className="text-xs text-teal-600 font-bold mb-1 ml-1">My Interest 🌟</label>
                  <select 
                      value={interest}
                      onChange={(e) => setInterest(e.target.value as UserInterest)}
                      className="bg-teal-50 border border-teal-200 text-teal-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 font-medium min-w-[160px]"
                  >
                      {Object.values(UserInterest).map((i) => (
                          <option key={i} value={i}>{i}</option>
                      ))}
                  </select>
              </div>

              {/* Voice Dropdown */}
              <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-semibold mb-1 ml-1">Voice</label>
                  <select 
                      value={voice}
                      onChange={(e) => setVoice(e.target.value as VoiceGender)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 min-w-[100px]"
                  >
                      {Object.values(VoiceGender).map((v) => (
                          <option key={v} value={v}>{v}</option>
                      ))}
                  </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
               {/* Dyslexia Toggle */}
               <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-semibold text-slate-600">Dyslexia Font</span>
                  <button 
                    onClick={() => setIsDyslexicFont(!isDyslexicFont)}
                    className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors focus:outline-none ${isDyslexicFont ? 'bg-teal-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform ${isDyslexicFont ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
               </div>

               {/* Download Notes */}
               <button 
                 onClick={handleDownloadNotes}
                 disabled={!data.story && !data.quiz}
                 className="flex items-center space-x-2 text-slate-600 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 title="Download Notes"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 <span className="text-sm font-medium hidden sm:inline">Save Notes</span>
               </button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px]">
          {/* Left Panel: Upload Zone */}
          <div className="lg:w-1/2 flex flex-col h-full">
            <ImageUploader 
              image={image} 
              onImageUpload={handleImageUpload} 
              onClear={handleClear} 
              isThinking={isLoading}
            />
          </div>

          {/* Right Panel: Knowledge Display */}
          <div className={`lg:w-1/2 flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden ${isDyslexicFont ? 'font-dyslexic' : ''}`}>
            {/* Tabs */}
            <div className="flex border-b border-slate-100 flex-none">
              <button
                onClick={() => setActiveTab(AppMode.STORY)}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === AppMode.STORY
                    ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Story Mode
              </button>
              <button
                onClick={() => setActiveTab(AppMode.QUIZ)}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === AppMode.QUIZ
                    ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Quiz Mode
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              {!image ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <p className="text-lg">Upload an image to start learning</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p>{error}</p>
                   <button onClick={() => window.location.reload()} className="text-sm underline">Try refreshing</button>
                </div>
              ) : isLoading ? (
                <LoadingSpinner mode={activeTab} />
              ) : (
                <>
                  {activeTab === AppMode.STORY && data.story && (
                    <StoryView 
                      content={data.story.content} 
                      reasoning={data.story.reasoning} 
                      voiceGender={voice}
                    />
                  )}
                  {activeTab === AppMode.QUIZ && data.quiz && (
                    <QuizView 
                      questions={data.quiz} 
                      onLoadMore={handleLoadMoreQuiz}
                      isLoadingMore={isMoreQuizLoading}
                    />
                  )}
                </>
              )}
            </div>

            {/* Chat Interface (Tutor Companion) */}
            {image && !isLoading && !error && (
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
          title="Accessibility Tools"
        >
           <span className="text-2xl">♿</span>
           <span className="font-semibold pr-1 hidden group-hover:block">Tools</span>
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
