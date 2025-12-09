
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isSending }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useAccessibility();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSending) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const containerBg = isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-slate-200';
  const messagesBg = isDarkMode ? 'bg-[#363636] border-gray-700' : 'bg-slate-50 border-slate-100';
  const inputBg = isDarkMode ? 'bg-[#1e1e1e] text-white focus:ring-teal-500' : 'bg-slate-100 text-slate-700 focus:ring-teal-500';
  const messageBubbleUser = 'bg-teal-600 text-white rounded-br-none';
  const messageBubbleModel = isDarkMode ? 'bg-[#404040] text-slate-200 border-gray-600 rounded-bl-none' : 'bg-white text-slate-700 border-slate-200 rounded-bl-none';

  return (
    <div className={`flex flex-col border-t ${containerBg}`}>
      {/* Messages Area - Only shows if there are messages */}
      {(messages.length > 0 || isSending) && (
        <div className={`max-h-[250px] overflow-y-auto p-4 space-y-3 border-b shadow-inner ${messagesBg}`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' ? messageBubbleUser : `border ${messageBubbleModel}`
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
               <div className={`border rounded-2xl rounded-bl-none px-4 py-2 shadow-sm text-sm flex items-center space-x-1.5 ${messageBubbleModel}`}>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-center space-x-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className={`w-full pl-4 pr-12 py-2.5 border border-transparent rounded-full focus:ring-2 focus:bg-transparent focus:border-transparent transition-all text-sm ${inputBg}`}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="absolute right-2 p-1.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
