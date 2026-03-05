import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  ExamState, 
  Question,
  ExamData,
  FlattenedQuestion,
  QuestionStatus,
  QuestionState
} from '../types';

interface ExamContextType {
  examData: ExamData | null;
  allQuestions: FlattenedQuestion[];
  userProfile: { full_name: string } | null;
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
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [examState, setExamState] = useState<ExamState>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // --- Actions ---
  const initializeSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setSessionId(id);
    try {
      // 1. Check Auth & Fetch Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (prof) setUserProfile(prof);
      }

      // 2. Fetch Session & Exam details
      const { data: session, error: sError } = await supabase
        .from('exam_sessions')
        .select('*, exams(name)')
        .eq('id', id)
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

      // 3. Fetch Subjects & Questions
      const { data: subjects, error: subError } = await supabase
        .from('subjects')
        .select('name, questions(*)')
        .eq('session_id', id)
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
            part: 'Section A', 
            subject: sub.name,
            question: questionObj
          });

          initialState[q.id] = {
            status: 'NOT_VISITED',
            selectedOption: null
          };
        });
      });

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

  const goToQuestion = useCallback((idx: number) => {
    if (isSubmitted || idx < 0 || idx >= allQuestions.length) return;
    setCurrentIdx(idx);
    const qId = allQuestions[idx].question.question_id;
    setExamState((prev) => {
      const qState = prev[qId];
      if (qState && qState.status === 'NOT_VISITED') {
        return { ...prev, [qId]: { ...qState, status: 'VISITED' } };
      }
      return prev;
    });
  }, [allQuestions, isSubmitted]);

  const selectOption = useCallback((option: string) => {
    if (isSubmitted) return;
    const currentEntry = allQuestions[currentIdx];
    if (!currentEntry) return;
    const qId = currentEntry.question.question_id.toString();
    setExamState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: option }
    }));
  }, [allQuestions, currentIdx, isSubmitted]);

  const clearResponse = useCallback(() => {
    if (isSubmitted) return;
    const currentEntry = allQuestions[currentIdx];
    if (!currentEntry) return;
    const qId = currentEntry.question.question_id.toString();
    setExamState((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: null, status: 'VISITED' }
    }));
  }, [allQuestions, currentIdx, isSubmitted]);

  const saveAndNext = useCallback(() => {
    if (isSubmitted) return;
    const currentEntry = allQuestions[currentIdx];
    if (!currentEntry) return;
    const qId = currentEntry.question.question_id.toString();

    setExamState((prev) => {
      const hasOption = prev[qId]?.selectedOption !== null;
      const newStatus: QuestionStatus = hasOption ? 'ANSWERED' : 'VISITED';
      return { ...prev, [qId]: { ...prev[qId], status: newStatus } };
    });

    if (currentIdx < allQuestions.length - 1) {
      goToQuestion(currentIdx + 1);
    }
  }, [allQuestions, currentIdx, goToQuestion, isSubmitted]);

  const markForReview = useCallback(() => {
    if (isSubmitted) return;
    const currentEntry = allQuestions[currentIdx];
    if (!currentEntry) return;
    const qId = currentEntry.question.question_id.toString();

    setExamState((prev) => {
      const hasOption = prev[qId]?.selectedOption !== null;
      const newStatus: QuestionStatus = hasOption ? 'ANSWERED_MARKED' : 'MARKED';
      return { ...prev, [qId]: { ...prev[qId], status: newStatus } };
    });

    if (currentIdx < allQuestions.length - 1) {
      goToQuestion(currentIdx + 1);
    }
  }, [allQuestions, currentIdx, goToQuestion, isSubmitted]);

  const jumpToSubject = useCallback((subjectKey: string) => {
    if (isSubmitted) return;
    const firstIdx = allQuestions.findIndex(q => `${q.part} - ${q.subject}` === subjectKey);
    if (firstIdx !== -1) {
      goToQuestion(firstIdx);
    }
  }, [allQuestions, goToQuestion, isSubmitted]);

  // --- Submission Logic ---
  const submitExamInternal = async () => {
    if (isSubmitted) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found.");

      let totalScore = 0;
      const correctMark = examData?.exam_details.correct_answer_weightage || 4;
      const negativeMark = parseFloat(examData?.exam_details.negative_marking || "1");

      const responses = allQuestions.map(fq => {
        const qId = fq.question.question_id;
        const userAns = examState[qId]?.selectedOption;
        const correctAns = fq.question.correct_answer;
        const isCorrect = userAns === correctAns;
        if (userAns !== null) {
          if (isCorrect) totalScore += correctMark;
          else totalScore -= negativeMark;
        }
        return {
          question_id: qId,
          selected_option: userAns,
          is_correct: isCorrect,
          time_spent_seconds: 0
        };
      });

      const { data: attempt, error: aError } = await supabase
        .from('attempts')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          total_score: totalScore,
          completed_at: new Date().toISOString()
        })
        .select().single();

      if (aError) throw aError;

      const finalResponses = responses.map(r => ({ ...r, attempt_id: attempt.id }));
      const { error: rError } = await supabase.from('attempt_responses').insert(finalResponses);
      if (rError) throw rError;

      setIsSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to save results.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitExam = useCallback(() => {
    if (window.confirm("Submit exam?")) {
      submitExamInternal();
    }
  }, [examData, examState, allQuestions, sessionId, isSubmitted]);

  // --- Timer ---
  useEffect(() => {
    if (!isInitialized || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitExamInternal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInitialized, isSubmitted]);

  const value = {
    examData,
    allQuestions,
    userProfile,
    currentIdx,
    currentQuestion: allQuestions[currentIdx]?.question || null,
    currentPart: allQuestions[currentIdx]?.part || '',
    currentSubject: allQuestions[currentIdx]?.subject || '',
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
  if (context === undefined) throw new Error('useExam must be used within an ExamProvider');
  return context;
};
