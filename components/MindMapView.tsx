
import React, { useState } from 'react';
import { MindMapData, MindMapNode, AppLanguage } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getTranslation } from '../utils/translations';

interface MindMapViewProps {
  data: MindMapData;
  language: AppLanguage;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ data, language }) => {
  const { isDarkMode, bgColor } = useAccessibility();
  const [hoveredNode, setHoveredNode] = useState<MindMapNode | null>(null);
  
  // Calculate positions for radial layout
  const count = data.subTopics.length;
  const radius = 160; // px
  
  const isDarkBg = bgColor === '#1e1e1e' || bgColor === '#2d2d2d' || (bgColor === '#ffffff' && isDarkMode === false ? false : bgColor !== '#ffffff' && bgColor !== '#FDF5E6' && bgColor !== '#E6F2FF');

  const panelBg = isDarkBg ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100 shadow-sm';
  const textColor = isDarkBg ? 'text-slate-200' : 'text-slate-700';

  return (
    <div className={`w-full h-full min-h-[700px] flex flex-col items-center justify-between py-8 transition-colors ${isDarkBg ? 'bg-[#2d2d2d]' : 'bg-slate-50'}`}>
      
      {/* Map Visualization Area */}
      <div className="relative w-[500px] h-[450px] flex items-center justify-center animate-fade-in shrink-0">
        
        {/* Main Topic (Center) */}
        <div className="z-20 w-40 h-40 rounded-full bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center justify-center text-center p-4 border-4 border-white animate-[pulse_3s_infinite]">
          <span className="text-white font-bold text-lg leading-tight break-words">{data.mainTopic}</span>
        </div>

        {/* Sub Topics (Orbiting) */}
        {data.subTopics.map((sub, index) => {
          const angle = (index * (360 / count)) * (Math.PI / 180); // Radians
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const isHovered = hoveredNode === sub;

          return (
            <div 
              key={index}
              className="absolute z-30"
              style={{ 
                transform: `translate(${x}px, ${y}px)`
              }}
            >
              {/* Connector Line */}
              <div 
                className={`absolute top-1/2 left-1/2 w-[160px] h-[2px] origin-left -z-10 transition-colors duration-300 ${isHovered ? 'bg-teal-400 h-[3px]' : isDarkBg ? 'bg-slate-600' : 'bg-slate-300'}`}
                style={{ 
                  transform: `rotate(${index * (360 / count)}deg) translate(-160px, -50%) rotate(180deg)`,
                  width: '160px'
                }}
              />

              {/* Bubble */}
              <div 
                onMouseEnter={() => setHoveredNode(sub)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setHoveredNode(sub)} // Tap support
                className={`w-28 h-28 rounded-full border-2 shadow-lg flex items-center justify-center text-center p-2 cursor-pointer transition-all duration-300 ${isHovered ? 'scale-110 border-teal-400 ring-4 ring-teal-500/20' : ''} ${isDarkBg ? 'bg-slate-800 border-teal-500 text-slate-200' : 'bg-white border-teal-200 text-slate-700'}`}
              >
                <span className="text-xs font-semibold break-words pointer-events-none">{sub.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Description Panel (Fixed Bottom) */}
      <div className={`w-full max-w-3xl mx-auto px-6 mt-4`}>
        <div className={`rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center text-center h-[160px] ${panelBg}`}>
          {hoveredNode ? (
            <div className="animate-fade-in space-y-2">
              <h3 className="text-teal-500 font-bold text-xl uppercase tracking-wider">{hoveredNode.title}</h3>
              <p className={`text-lg font-medium leading-relaxed max-w-2xl ${textColor}`}>
                {hoveredNode.description}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-50 space-y-2">
              <span className="text-3xl animate-bounce">👆</span>
              <p className={`text-sm font-medium uppercase tracking-widest ${isDarkBg ? 'text-slate-500' : 'text-slate-400'}`}>
                {getTranslation(language, 'mindMapHint')}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
