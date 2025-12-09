import React, { useCallback } from 'react';

interface ImageUploaderProps {
  image: string | null;
  onImageUpload: (base64: string) => void;
  onClear: () => void;
  isThinking?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageUpload, onClear, isThinking = false }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      processFile(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (image) {
    return (
      <div 
        className={`relative w-full h-full min-h-[400px] flex flex-col rounded-2xl overflow-hidden shadow-lg group transition-all duration-700 ${
          isThinking 
            ? 'shadow-[0_0_40px_rgba(20,184,166,0.3)] ring-2 ring-teal-500/30' 
            : 'shadow-lg'
        }`}
        style={{ backgroundColor: '#1e1e1e' }}
      >
        <img 
          src={image} 
          alt="Uploaded study material" 
          className={`w-full h-full object-contain transition-opacity duration-700 ${isThinking ? 'opacity-80' : 'opacity-90'}`} 
        />
        
        {/* Thinking Overlay */}
        {isThinking && (
          <div className="absolute inset-0 bg-teal-900/10 flex items-end justify-center pb-8 animate-pulse">
            <span className="text-teal-400 font-mono text-xs tracking-widest uppercase bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Analyzing Visuals...
            </span>
          </div>
        )}

        <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isThinking ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={onClear}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all font-semibold"
          >
            Change Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full h-full min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-slate-300 rounded-3xl bg-white hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 cursor-pointer group"
    >
      <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
        <div className="p-4 bg-teal-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-semibold text-slate-700 mb-2">Upload Visual Notes</span>
        <span className="text-sm text-slate-500 text-center max-w-xs">
          Drag & drop an image here, or click to browse. <br/> Supports PNG, JPG.
        </span>
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/jpg" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </label>
    </div>
  );
};