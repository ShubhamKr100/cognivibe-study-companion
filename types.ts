
export enum AppMode {
  STORY = 'STORY',
  QUIZ = 'QUIZ',
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

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
}

export interface StoryData {
  content: string;
  reasoning: string;
}

export interface AnalysisState {
  story: StoryData | null;
  quiz: QuizQuestion[] | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
