// Quiz-related TypeScript interfaces and types

// Enums matching FE
export enum ContentName {
  Kanji = 0,
  Vocabulary = 1,
  Grammar = 2,
  Reading = 3,
  Listening = 4
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4
}

export enum SubContentName {
  Mondai1 = 0, // Đọc chữ Hán
  Mondai2 = 1, // Nhớ chữ Hán
  Mondai3 = 2, // Chọn từ phù hợp với câu
  Mondai4 = 3, // Tìm câu có cách diễn đạt giống
  Mondai5 = 4, // Chọn ngữ pháp phù hợp với câu
  Mondai6 = 5, // Sắp xếp câu
  Mondai7 = 6, // Tìm đáp án đúng để hoàn thành đoạn văn
  Mondai8 = 7, // Đoạn văn ngắn
  Mondai9 = 8, // Trung văn
  Mondai10 = 9, // Tìm kiếm thông tin
  Mondai11 = 10, // Hiểu đề bài
  Mondai12 = 11, // Hiểu điểm chính
  Mondai13 = 12, // Diễn đạt bằng lời nói
  Mondai14 = 13, // Phản hồi tức thời
}

// DTOs matching FE
export interface GetRandomQuestionsRequestDto {
  numberOfQuestions: number;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
}

export interface RandomChoiceDto {
  choiceId: string;
  content: string;
  isCorrect: boolean;
}

export interface RandomQuestionWithChoicesDto {
  questionId: string;
  questionText: string;
  explanation: string;
  choices: RandomChoiceDto[];
}

export interface SubContent {
  subContentId: string;
  subContentName: string;
  level: string;
  contentName: string;
}

export interface Choice {
  choiceId: string;
  questionId: string;
  choiceText: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: string;
  subContentId: string;
  questionText: string;
  questionType: string;
  explanation?: string;
  difficulty: string;
  points: number;
  isActive: boolean;
  choices: Choice[];
  attachment?: QuestionAttachment;
}

export interface QuestionAttachment {
  attachmentId: string;
  questionId: string;
  mediaUrl: string;
  mediaType: string;
}

export interface QuizSession {
  id: string;
  subContentIds: string[];
  questions: RandomQuestionWithChoicesDto[];
  currentQuestionIndex: number;
  answers: { [key: number]: string };
  userAnswers: { [key: number]: string }; // Track individual answers for navigation
  startTime: Date;
  endTime?: Date;
  score: number;
  totalPoints: number;
  timeLimit?: number; // in seconds per question
}

export interface UserAnswer {
  questionId: string;
  choiceId: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  points: number;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  averageTimePerQuestion: number;
  completedAt: Date;
}

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuizState = 'idle' | 'loading' | 'active' | 'completed' | 'error';

// Labels for display (matching FE)
export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  [CourseLevel.N5]: "N5",
  [CourseLevel.N4]: "N4",
  [CourseLevel.N3]: "N3",
  [CourseLevel.N2]: "N2",
  [CourseLevel.N1]: "N1",
};

export const CONTENT_NAME_LABELS: Record<ContentName, string> = {
  [ContentName.Kanji]: "Chữ Hán",
  [ContentName.Vocabulary]: "Từ Vựng",
  [ContentName.Grammar]: "Ngữ Pháp",
  [ContentName.Reading]: "Đọc Hiểu",
  [ContentName.Listening]: "Nghe Hiểu",
};

export const SUBCONTENT_NAME_LABELS: Record<SubContentName, string> = {
  [SubContentName.Mondai1]: "Đọc chữ Hán",
  [SubContentName.Mondai2]: "Nhớ chữ Hán",
  [SubContentName.Mondai3]: "Chọn từ phù hợp với câu",
  [SubContentName.Mondai4]: "Tìm câu có cách diễn đạt giống",
  [SubContentName.Mondai5]: "Chọn ngữ pháp phù hợp với câu",
  [SubContentName.Mondai6]: "Sắp xếp câu",
  [SubContentName.Mondai7]: "Tìm đáp án đúng để hoàn thành đoạn văn",
  [SubContentName.Mondai8]: "Đoạn văn ngắn",
  [SubContentName.Mondai9]: "Trung văn",
  [SubContentName.Mondai10]: "Tìm kiếm thông tin",
  [SubContentName.Mondai11]: "Hiểu đề bài",
  [SubContentName.Mondai12]: "Hiểu điểm chính",
  [SubContentName.Mondai13]: "Diễn đạt bằng lời nói",
  [SubContentName.Mondai14]: "Phản hồi tức thời",
};
