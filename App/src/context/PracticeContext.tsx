import React, { createContext, useContext, useState } from 'react';
import { practiceDataService } from '../lib/practiceDataService';
import type { PinnacleQuestion } from '../lib/practiceDataService';
import { soundService } from '../lib/soundService';

interface PracticeState {
  questions: PinnacleQuestion[];
  currentIdx: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
  history: { [id: number]: { selected: string; correct: boolean } };
  isLoading: boolean;
  currentSubject: string | null;
  availableTopics: string[];
  activeTopics: string[]; // Used as tags for filtering
}

interface PracticeContextType extends PracticeState {
  startPractice: (subject: string) => Promise<void>;
  nextQuestion: () => void;
  prevQuestion: () => void;
  skipQuestion: () => void;
  selectOption: (option: string) => void;
  toggleExplanation: () => void;
  toggleTopicTag: (topic: string) => void;
  jumpToQuestion: (idx: number) => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PracticeState>({
    questions: [],
    currentIdx: 0,
    selectedOption: null,
    isCorrect: null,
    showExplanation: false,
    history: {},
    isLoading: false,
    currentSubject: null,
    availableTopics: [],
    activeTopics: [],
  });

  const startPractice = async (subject: string) => {
    setState((prev: PracticeState) => ({ ...prev, isLoading: true, currentSubject: subject }));
    try {
      const [questions, topics] = await Promise.all([
        practiceDataService.getQuestionsBySubject(subject),
        practiceDataService.getTopicsForSubject(subject),
      ]);
      setState((prev: PracticeState) => ({
        ...prev,
        questions,
        availableTopics: topics,
        activeTopics: [], // Initially no filter
        currentIdx: 0,
        selectedOption: null,
        isCorrect: null,
        showExplanation: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error starting practice:', error);
      setState((prev: PracticeState) => ({ ...prev, isLoading: false }));
    }
  };

  const selectOption = (option: string) => {
    const currentQ = state.questions[state.currentIdx];
    if (!currentQ || state.selectedOption) return; // Prevent double answering

    const correct = option.toLowerCase() === currentQ.answer.toLowerCase();
    
    // Play subtle feedback sounds
    if (correct) {
      soundService.playSuccess();
    } else {
      soundService.playFailure();
    }

    setState((prev: PracticeState) => ({
      ...prev,
      selectedOption: option,
      isCorrect: correct,
      showExplanation: true,
      history: {
        ...prev.history,
        [currentQ.id]: { selected: option, correct }
      }
    }));
  };

  const nextQuestion = () => {
    if (state.currentIdx < state.questions.length - 1) {
      const nextIdx = state.currentIdx + 1;
      const nextQ = state.questions[nextIdx];
      const prevSession = state.history[nextQ.id];

      setState((prev: PracticeState) => ({
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

      setState((prev: PracticeState) => ({
        ...prev,
        currentIdx: prevIdx,
        selectedOption: prevSession?.selected || null,
        isCorrect: prevSession?.correct ?? null,
        showExplanation: prevSession ? true : false,
      }));
    }
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const toggleExplanation = () => {
    setState((prev: PracticeState) => ({ ...prev, showExplanation: !prev.showExplanation }));
  };

  const jumpToQuestion = (idx: number) => {
    if (idx >= 0 && idx < state.questions.length) {
      const q = state.questions[idx];
      const prevSession = state.history[q.id];
      setState((prev: PracticeState) => ({
        ...prev,
        currentIdx: idx,
        selectedOption: prevSession?.selected || null,
        isCorrect: prevSession?.correct ?? null,
        showExplanation: prevSession ? true : false,
      }));
    }
  };

  const toggleTopicTag = (topic: string) => {
    setState((prev: PracticeState) => {
      const newActive = prev.activeTopics.includes(topic)
        ? prev.activeTopics.filter(t => t !== topic)
        : [...prev.activeTopics, topic];
      // Note: Filtering logic would happen here or in a derived state
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
      jumpToQuestion
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
