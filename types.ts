
export enum AppMode {
  STORY = 'STORY',
  QUIZ = 'QUIZ',
  MINDMAP = 'MINDMAP',
}

export enum AppLanguage {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  FRENCH = 'French',
  GERMAN = 'German',
  JAPANESE = 'Japanese',
  RUSSIAN = 'Russian',
  CHINESE = 'Chinese',
}

export enum ExplanationStyle {
  BULLET_POINTS = 'Bullet Points',
  PARAGRAPH = 'Paragraph',
  STORY_FORMAT = 'Story Format',
  REAL_LIFE_ANALOGY = 'Real-life Analogy',
}

export enum VoiceGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum UserInterest {
  GENERAL = 'General (Default)',
  MINECRAFT = 'Minecraft',
  CRICKET = 'Cricket',
  MARVEL = 'Marvel Universe',
  HARRY_POTTER = 'Harry Potter',
}

export enum SoundscapeType {
  OFF = 'OFF',
  BROWN_NOISE = 'BROWN_NOISE',
  RAIN = 'RAIN',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
}

export interface StoryData {
  tldr: string[]; // Array of 3 short bullet points
  content: string;
  reasoning: string;
}

export interface MindMapNode {
  title: string;
  description: string;
}

export interface MindMapData {
  mainTopic: string;
  subTopics: MindMapNode[];
}

export interface AnalysisState {
  story: StoryData | null;
  quiz: QuizQuestion[] | null;
  mindMap: MindMapData | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MagicStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface RapidQuizItem {
  id: string;
  question: string;
  answer: string; // "True", "False", or short answer
  explanation: string; // Short encouraging feedback
}
