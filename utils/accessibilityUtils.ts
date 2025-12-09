
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

export const processText = (text: string, bionic: boolean, syllables: boolean): string => {
  let processed = text;
  if (syllables) processed = applySyllableBreakdown(processed);
  if (bionic) processed = applyBionicReading(processed);
  return processed;
};
