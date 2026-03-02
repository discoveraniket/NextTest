import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import examDataRaw from '../questions.json';
import type { 
  ExamData, 
  ExamState, 
  Question,
  QuestionState,
} from '../types';

const examData = examDataRaw as unknown as ExamData;

interface FlattenedQuestion {
  part: string;
  subject: string;
  question: Question;
}

interface ExamContextType {
  examData: ExamData;
  allQuestions: FlattenedQuestion[];
  currentIdx: number;
  currentQuestion: Question;
  currentPart: string;
  currentSubject: string;
  examState: ExamState;
  timeLeft: number;
  isInitialized: boolean;
  goToQuestion: (idx: number) => void;
  selectOption: (option: string) => void;
  clearResponse: () => void;
  saveAndNext: () => void;
  markForReview: () => void;
  jumpToSubject: (subjectKey: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
  // --- Data Flattening for Navigation ---
  const allQuestions = useMemo(() => {
    const list: FlattenedQuestion[] = [];
    if (!examData || !examData.sections) return list;
    
    Object.entries(examData.sections).forEach(([partName, subjects]) => {
      Object.entries(subjects).forEach(([subjectName, questions]) => {
        questions.forEach((q) => {
          list.push({ part: partName, subject: subjectName, question: q });
        });
      });
    });
    return list;
  }, []);

  // --- Core State ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [examState, setExamState] = useState<ExamState>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(examData?.exam_details?.duration_minutes * 60 || 5400);

  // --- Initialization ---
  useEffect(() => {
    if (allQuestions.length > 0 && !isInitialized) {
      const initialState: ExamState = {};
      allQuestions.forEach(({ question }) => {
        initialState[question.question_id] = {
          status: 'NOT_VISITED',
          selectedOption: null,
        };
      });
      // Mark the first question as visited
      const firstQId = allQuestions[0].question.question_id;
      initialState[firstQId].status = 'VISITED';
      setExamState(initialState);
      setIsInitialized(true);
    }
  }, [allQuestions, isInitialized]);

  // --- Timer ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Derived State ---
  const currentEntry = allQuestions[currentIdx];
  const currentQuestion = currentEntry?.question;
  const currentPart = currentEntry?.part;
  const currentSubject = currentEntry?.subject;

  // --- Actions ---
  const goToQuestion = useCallback((idx: number) => {
    if (idx < 0 || idx >= allQuestions.length) return;
    
    setCurrentIdx(idx);
    const qId = allQuestions[idx].question.question_id;
    
    setExamState((prev) => {
      const qState = prev[qId];
      if (qState && qState.status === 'NOT_VISITED') {
        return {
          ...prev,
          [qId]: { ...qState, status: 'VISITED' }
        };
      }
      return prev;
    });
  }, [allQuestions]);

  const selectOption = useCallback((option: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;
    setExamState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: option }
    }));
  }, [currentQuestion]);

  const clearResponse = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;
    setExamState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: null }
    }));
  }, [currentQuestion]);

  const saveAndNext = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;

    setExamState((prev) => {
      const hasOption = prev[qId]?.selectedOption !== null;
      return {
        ...prev,
        [qId]: { 
          ...prev[qId], 
          status: hasOption ? 'ANSWERED' : 'VISITED' 
        }
      };
    });

    if (currentIdx < allQuestions.length - 1) {
      goToQuestion(currentIdx + 1);
    }
  }, [currentQuestion, currentIdx, allQuestions, goToQuestion]);

  const markForReview = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;

    setExamState((prev) => {
      const hasOption = prev[qId]?.selectedOption !== null;
      return {
        ...prev,
        [qId]: { 
          ...prev[qId], 
          status: hasOption ? 'ANSWERED_MARKED' : 'MARKED' 
        }
      };
    });

    if (currentIdx < allQuestions.length - 1) {
      goToQuestion(currentIdx + 1);
    }
  }, [currentQuestion, currentIdx, allQuestions, goToQuestion]);

  const jumpToSubject = useCallback((subjectKey: string) => {
    const firstIdx = allQuestions.findIndex(q => `${q.part} - ${q.subject}` === subjectKey);
    if (firstIdx !== -1) {
      goToQuestion(firstIdx);
    }
  }, [allQuestions, goToQuestion]);

  const value = {
    examData,
    allQuestions,
    currentIdx,
    currentQuestion,
    currentPart,
    currentSubject,
    examState,
    timeLeft,
    isInitialized,
    goToQuestion,
    selectOption,
    clearResponse,
    saveAndNext,
    markForReview,
    jumpToSubject,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
