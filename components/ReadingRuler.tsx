
import React, { useState, useEffect } from 'react';

export const ReadingRuler: React.FC = () => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to viewport, but we want it fixed usually
      // Just tracking Y is enough
      setPosition(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden h-full w-full">
      {/* Top Dim */}
      <div 
        className="absolute top-0 left-0 w-full bg-black/20 transition-all duration-75"
        style={{ height: Math.max(0, position - 40) + 'px' }}
      />
      
      {/* Ruler Line */}
      <div 
        className="absolute w-full bg-yellow-300/30 border-y border-yellow-400/50 transition-all duration-75"
        style={{ top: Math.max(0, position - 40) + 'px', height: '80px' }}
      />

      {/* Bottom Dim */}
      <div 
        className="absolute left-0 w-full bg-black/20 transition-all duration-75"
        style={{ top: (position + 40) + 'px', bottom: 0 }}
      />
    </div>
  );
};
