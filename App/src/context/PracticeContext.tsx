import React, { createContext, useContext, useState } from 'react';
import { practiceDataService } from '../lib/practiceDataService';
import type { PinnacleQuestion } from '../lib/practiceDataService';
import { soundService } from '../lib/soundService';
import { supabase } from '../lib/supabase';

interface PracticeState {
  questions: PinnacleQuestion[];
  originalQuestions: PinnacleQuestion[]; // For restoring chronological order
  currentIdx: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
  history: { [id: string]: { selected: string; correct: boolean } };
  isLoading: boolean;
  currentSubjectId: string | null;
  availableTopics: string[];
  activeTopics: string[];
  isRandomized: boolean;
}

interface PracticeContextType extends PracticeState {
  startPractice: (subjectId: string) => Promise<void>;
  nextQuestion: () => void;
  prevQuestion: () => void;
  skipQuestion: () => void;
  selectOption: (option: string) => void;
  toggleExplanation: () => void;
  toggleTopicTag: (topic: string) => void;
  jumpToQuestion: (idx: number) => void;
  toggleRandomize: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PracticeState>({
    questions: [],
    originalQuestions: [],
    currentIdx: 0,
    selectedOption: null,
    isCorrect: null,
    showExplanation: false,
    history: {},
    isLoading: false,
    currentSubjectId: null,
    availableTopics: [],
    activeTopics: [],
    isRandomized: false,
  });

  const startPractice = async (subjectId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, currentSubjectId: subjectId }));
    try {
      const [questions, topics] = await Promise.all([
        practiceDataService.getQuestionsBySubject(subjectId),
        practiceDataService.getTopicsForSubject(subjectId),
      ]);
      
      setState((prev) => ({
        ...prev,
        questions,
        originalQuestions: [...questions],
        availableTopics: topics,
        activeTopics: [],
        currentIdx: 0,
        selectedOption: null,
        isCorrect: null,
        showExplanation: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error starting practice:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const selectOption = async (option: string) => {
    const currentQ = state.questions[state.currentIdx];
    if (!currentQ || state.selectedOption) return;

    const correct = option.toLowerCase() === currentQ.correct_answer.toLowerCase();
    
    // Play feedback sounds
    if (correct) {
      soundService.playSuccess();
    } else {
      soundService.playFailure();
    }

    setState((prev) => ({
      ...prev,
      selectedOption: option,
      isCorrect: correct,
      showExplanation: true,
      history: {
        ...prev.history,
        [currentQ.id]: { selected: option, correct }
      }
    }));

    // Log Telemetry (Async, don't wait)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      practiceDataService.logInteraction(session.user.id, currentQ.id, correct, option, 0, 0);
    }
  };

  const nextQuestion = () => {
    if (state.currentIdx < state.questions.length - 1) {
      const nextIdx = state.currentIdx + 1;
      const nextQ = state.questions[nextIdx];
      const prevSession = state.history[nextQ.id];

      setState((prev) => ({
        ...prev,
        currentIdx: nextIdx,
        selectedOption: prevSession?.selected || null,
        isCorrect: prevSession?.correct ?? null,
        showExplanation: prevSession ? true : false,
      }));
    }
  };

  const prevQuestion = () => {
    if (state.currentIdx > 0) {
      const prevIdx = state.currentIdx - 1;
      const prevQ = state.questions[prevIdx];
      const prevSession = state.history[prevQ.id];

      setState((prev) => ({
        ...prev,
        currentIdx: prevIdx,
        selectedOption: prevSession?.selected || null,
        isCorrect: prevSession?.correct ?? null,
        showExplanation: prevSession ? true : false,
      }));
    }
  };

  const toggleRandomize = () => {
    setState((prev) => {
      const newRandomized = !prev.isRandomized;
      const newQuestions = newRandomized 
        ? shuffleArray(prev.originalQuestions) 
        : [...prev.originalQuestions];
      
      return {
        ...prev,
        isRandomized: newRandomized,
        questions: newQuestions,
        currentIdx: 0,
        selectedOption: null,
        isCorrect: null,
        showExplanation: false,
      };
    });
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const toggleExplanation = () => {
    setState((prev) => ({ ...prev, showExplanation: !prev.showExplanation }));
  };

  const jumpToQuestion = (idx: number) => {
    if (idx >= 0 && idx < state.questions.length) {
      const q = state.questions[idx];
      const prevSession = state.history[q.id];
      setState((prev) => ({
        ...prev,
        currentIdx: idx,
        selectedOption: prevSession?.selected || null,
        isCorrect: prevSession?.correct ?? null,
        showExplanation: prevSession ? true : false,
      }));
    }
  };

  const toggleTopicTag = (topic: string) => {
    setState((prev) => {
      const newActive = prev.activeTopics.includes(topic)
        ? prev.activeTopics.filter(t => t !== topic)
        : [...prev.activeTopics, topic];
      return { ...prev, activeTopics: newActive };
    });
  };

  return (
    <PracticeContext.Provider value={{ 
      ...state, 
      startPractice, 
      nextQuestion, 
      prevQuestion, 
      skipQuestion, 
      selectOption, 
      toggleExplanation, 
      toggleTopicTag,
      jumpToQuestion,
      toggleRandomize
    }}>
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) throw new Error('usePractice must be used within a PracticeProvider');
  return context;
};
