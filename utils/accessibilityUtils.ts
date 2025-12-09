
export const applyBionicReading = (text: string): string => {
  // Simple heuristic: Bold the first 40% of characters in words > 3 chars
  return text.split(' ').map(word => {
    // Skip HTML tags or very short words
    if (word.startsWith('<') || word.length < 2) return word; 
    
    // Strip punctuation for length calculation to avoid bolding dots/commas if possible, 
    // but for simplicity in this demo, just calculate based on string length
    const splitIndex = Math.ceil(word.length * 0.4);
    const start = word.slice(0, splitIndex);
    const end = word.slice(splitIndex);
    
    return `<b class="font-bold text-slate-900">${start}</b>${end}`;
  }).join(' ');
};

export const applySyllableBreakdown = (text: string): string => {
  return text.split(' ').map(word => {
    // Skip short words or HTML tags
    if (word.length <= 6 || word.startsWith('<')) return word;
    
    // Simple Heuristic: Vowel followed by Consonant -> Insert dot
    // This is not linguistically perfect but provides the visual effect requested
    return word.replace(/([aeiouyAEIOUY])([bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ])/g, '$1·$2');
  }).join(' ');
};

export const applyMicroChunking = (text: string): string => {
  // 1. Split into paragraphs first
  const paragraphs = text.split('\n');
  
  return paragraphs.map(p => {
    // If it's a header or very short, leave it alone
    if (p.startsWith('#') || p.length < 50) return p;
    
    // 2. Split sentences
    const sentences = p.split(/(?<=[.!?])\s+/);
    
    // If paragraph has multiple sentences, turn them into a bullet list (pseudo-markdown)
    if (sentences.length > 1) {
       return sentences.map(s => `• ${s}`).join('\n\n');
    }
    
    return p;
  }).join('\n\n');
};

export const processText = (text: string, bionic: boolean, syllables: boolean): string => {
  let processed = text;
  if (syllables) processed = applySyllableBreakdown(processed);
  if (bionic) processed = applyBionicReading(processed);
  return processed;
};

export const cleanTextForTTS = (text: string): string => {
  return text
    // Remove Markdown headers, bold, italic markers, ticks, tildes
    .replace(/[#*_`~]/g, '')
    // Remove links [text](url) - keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove Emojis (Surrogates, Dingbats, Transport, etc.)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}\u{2B00}-\u{2BFF}\u{200D}]/gu, '')
    // Remove excessive punctuation/dashes often found in AI lists
    .replace(/^[-•]\s*/gm, '') // Remove bullet points at start of lines
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
};
