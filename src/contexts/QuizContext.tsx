import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  QuizSession,
  RandomQuestionWithChoicesDto,
  UserAnswer,
  QuizResult,
  QuizState,
  GetRandomQuestionsRequestDto
} from '../types/quiz';
import { quizService } from '../services/quizService';

interface QuizContextType {
  state: QuizState;
  session: QuizSession | null;
  startQuiz: (request: GetRandomQuestionsRequestDto) => Promise<void>;
  answerQuestion: (choiceId: string) => void;
  saveUserAnswer: (questionIndex: number, choiceId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuiz: () => QuizResult | null;
  resetQuiz: () => void;
  error: string | null;
}

type QuizAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'START_QUIZ'; payload: QuizSession }
  | { type: 'ANSWER_QUESTION'; payload: { choiceId: string; timeSpent: number } }
  | { type: 'SAVE_USER_ANSWER'; payload: { questionIndex: number; choiceId: string } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'FINISH_QUIZ' }
  | { type: 'RESET_QUIZ' };

interface QuizProviderProps {
  children: ReactNode;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const initialState: {
  state: QuizState;
  session: QuizSession | null;
  error: string | null;
} = {
  state: 'idle',
  session: null,
  error: null,
};

function quizReducer(state: typeof initialState, action: QuizAction) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, state: 'loading' as QuizState, error: null };

    case 'SET_ERROR':
      return { ...state, state: 'error' as QuizState, error: action.payload };

    case 'START_QUIZ':
      return {
        ...state,
        state: 'active' as QuizState,
        session: action.payload,
        error: null,
      };

    case 'ANSWER_QUESTION':
      if (!state.session) return state;

      const currentQuestion = state.session.questions[state.session.currentQuestionIndex];
      const selectedChoice = currentQuestion.choices.find(c => c.choiceId === action.payload.choiceId);

      if (!selectedChoice) return state;

      // Update answers object
      const updatedAnswers = { ...state.session.answers };
      updatedAnswers[state.session.currentQuestionIndex] = action.payload.choiceId;

      // Calculate score
      let correctCount = 0;
      Object.keys(updatedAnswers).forEach((index) => {
        const questionIndex = parseInt(index);
        const question = state.session!.questions[questionIndex];
        const choiceId = updatedAnswers[questionIndex];
        const choice = question.choices.find(c => c.choiceId === choiceId);
        if (choice?.isCorrect) correctCount++;
      });

      return {
        ...state,
        session: {
          ...state.session,
          answers: updatedAnswers,
          score: correctCount,
        },
      };

    case 'SAVE_USER_ANSWER':
      if (!state.session) return state;
      
      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.payload.questionIndex]: action.payload.choiceId
          }
        }
      };

    case 'NEXT_QUESTION':
      if (!state.session || state.session.currentQuestionIndex >= state.session.questions.length - 1) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          currentQuestionIndex: state.session.currentQuestionIndex + 1,
        },
      };

    case 'PREVIOUS_QUESTION':
      if (!state.session || state.session.currentQuestionIndex <= 0) {
        return state;
      }
      return {
        ...state,
        session: {
          ...state.session,
          currentQuestionIndex: state.session.currentQuestionIndex - 1,
        },
      };

    case 'FINISH_QUIZ':
      if (!state.session) return state;
      return {
        ...state,
        state: 'completed' as QuizState,
        session: {
          ...state.session,
          endTime: new Date(),
        },
      };

    case 'RESET_QUIZ':
      return initialState;

    default:
      return state;
  }
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const startQuiz = async (request: GetRandomQuestionsRequestDto) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const questions = await quizService.fetchRandomQuestions(request);

      const session: QuizSession = {
        id: `quiz_${Date.now()}`,
        subContentIds: [], // Will be populated if needed
        questions,
        currentQuestionIndex: 0,
        answers: {},
        userAnswers: {}, // Initialize empty userAnswers
        startTime: new Date(),
        score: 0,
        totalPoints: questions.length, // Each question is 1 point
        timeLimit: 30, // 30 seconds per question
      };

      dispatch({ type: 'START_QUIZ', payload: session });
    } catch (error: any) {
      console.error('Lỗi khi bắt đầu quiz:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể bắt đầu quiz. Vui lòng thử lại.' });
    }
  };

  const answerQuestion = (choiceId: string) => {
    if (!state.session) return;

    const timeSpent = 30; // Calculate actual time spent in real implementation
    dispatch({ type: 'ANSWER_QUESTION', payload: { choiceId, timeSpent } });
  };

  const saveUserAnswer = (questionIndex: number, choiceId: string) => {
    dispatch({ type: 'SAVE_USER_ANSWER', payload: { questionIndex, choiceId } });
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const previousQuestion = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };

  const finishQuiz = (): QuizResult | null => {
    if (!state.session) return null;

    dispatch({ type: 'FINISH_QUIZ' });

    const result: QuizResult = {
      sessionId: state.session.id,
      score: state.session.score,
      totalQuestions: state.session.questions.length,
      correctAnswers: state.session.score,
      totalTime: state.session.endTime
        ? state.session.endTime.getTime() - state.session.startTime.getTime()
        : 0,
      averageTimePerQuestion: 0, // Calculate based on answers
      completedAt: new Date(),
    };

    // Submit results to backend
    quizService.submitQuizResults(result).catch(console.error);

    return result;
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const contextValue: QuizContextType = {
    state: state.state,
    session: state.session,
    startQuiz,
    answerQuestion,
    saveUserAnswer,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz,
    error: state.error,
  };

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
