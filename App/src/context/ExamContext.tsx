import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  ExamState, 
  Question,
  ExamData,
  FlattenedQuestion
} from '../types';

interface ExamContextType {
  examData: ExamData | null;
  allQuestions: FlattenedQuestion[];
  currentIdx: number;
  currentQuestion: Question | null;
  currentPart: string;
  currentSubject: string;
  examState: ExamState;
  timeLeft: number;
  isInitialized: boolean;
  isSubmitted: boolean;
  isLoading: boolean;
  initializeSession: (sessionId: string) => Promise<void>;
  goToQuestion: (idx: number) => void;
  selectOption: (option: string) => void;
  clearResponse: () => void;
  saveAndNext: () => void;
  markForReview: () => void;
  jumpToSubject: (subjectKey: string) => void;
  submitExam: () => void;
  resetExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
  // --- Core State ---
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [allQuestions, setAllQuestions] = useState<FlattenedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [examState, setExamState] = useState<ExamState>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- Actions ---
  const initializeSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Session & Exam details
      const { data: session, error: sError } = await supabase
        .from('exam_sessions')
        .select('*, exams(name)')
        .eq('id', sessionId)
        .single();

      if (sError) throw sError;

      const formattedExamData: ExamData = {
        exam_details: {
          name: session.exams.name,
          year: session.year.toString(),
          duration_minutes: session.duration_minutes,
          correct_answer_weightage: session.correct_marks,
          negative_marking: session.negative_marks.toString()
        }
      };

      // 2. Fetch Subjects & Questions
      const { data: subjects, error: subError } = await supabase
        .from('subjects')
        .select('name, questions(*)')
        .eq('session_id', sessionId)
        .order('display_order', { ascending: true });

      if (subError) throw subError;

      const flattened: FlattenedQuestion[] = [];
      const initialState: ExamState = {};

      subjects.forEach((sub: any) => {
        sub.questions.forEach((q: any) => {
          const questionObj: Question = {
            question_id: q.id,
            question: q.content,
            options: q.options,
            correct_answer: q.correct_answer
          };
          
          flattened.push({
            part: 'Section A', // Default for now
            subject: sub.name,
            question: questionObj
          });

          initialState[q.id] = {
            status: 'NOT_VISITED',
            selectedOption: null
          };
        });
      });

      // Mark first question visited
      if (flattened.length > 0) {
        initialState[flattened[0].question.question_id].status = 'VISITED';
      }

      setExamData(formattedExamData);
      setAllQuestions(flattened);
      setExamState(initialState);
      setTimeLeft(session.duration_minutes * 60);
      setCurrentIdx(0);
      setIsSubmitted(false);
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize exam:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetExam = useCallback(() => {
    setExamState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id: any) => {
        next[id as any] = { status: 'NOT_VISITED', selectedOption: null };
      });
      if (allQuestions.length > 0) {
        next[allQuestions[0].question.question_id].status = 'VISITED';
      }
      return next;
    });
    setCurrentIdx(0);
    setTimeLeft((examData?.exam_details?.duration_minutes || 0) * 60);
    setIsSubmitted(false);
  }, [allQuestions, examData]);

  // --- Timer ---
  useEffect(() => {
    if (!isInitialized || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitialized, isSubmitted]);

  // --- Derived State ---
  const currentEntry = allQuestions[currentIdx] || null;
  const currentQuestion = currentEntry?.question || null;
  const currentPart = currentEntry?.part || '';
  const currentSubject = currentEntry?.subject || '';

  // --- Exam Actions (Standard CBT Logic) ---
  const goToQuestion = useCallback((idx: number) => {
    if (isSubmitted || idx < 0 || idx >= allQuestions.length) return;
    
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
  }, [allQuestions, isSubmitted]);

  const selectOption = useCallback((option: string) => {
    if (isSubmitted || !currentQuestion) return;
    const qId = currentQuestion.question_id;
    setExamState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: option }
    }));
  }, [currentQuestion, isSubmitted]);

  const clearResponse = useCallback(() => {
    if (isSubmitted || !currentQuestion) return;
    const qId = currentQuestion.question_id;
    setExamState((prev) => ({
      ...prev,
      [qId]: { 
        ...prev[qId], 
        selectedOption: null,
        status: 'VISITED'
      }
    }));
  }, [currentQuestion, isSubmitted]);

  const saveAndNext = useCallback(() => {
    if (isSubmitted || !currentQuestion) return;
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
  }, [currentQuestion, currentIdx, allQuestions, goToQuestion, isSubmitted]);

  const markForReview = useCallback(() => {
    if (isSubmitted || !currentQuestion) return;
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
  }, [currentQuestion, currentIdx, allQuestions, goToQuestion, isSubmitted]);

  const jumpToSubject = useCallback((subjectKey: string) => {
    if (isSubmitted) return;
    const firstIdx = allQuestions.findIndex(q => `${q.part} - ${q.subject}` === subjectKey);
    if (firstIdx !== -1) {
      goToQuestion(firstIdx);
    }
  }, [allQuestions, goToQuestion, isSubmitted]);

  const submitExam = useCallback(() => {
    if (window.confirm("Are you sure you want to submit your exam?")) {
      setIsSubmitted(true);
    }
  }, []);

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
    isSubmitted,
    isLoading,
    initializeSession,
    goToQuestion,
    selectOption,
    clearResponse,
    saveAndNext,
    markForReview,
    jumpToSubject,
    submitExam,
    resetExam,
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
