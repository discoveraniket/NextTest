import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FastForward, 
  Lightbulb, 
  Settings,
  MoreVertical,
  Maximize2
} from 'lucide-react';
import { usePractice } from '../context/PracticeContext';
import { PracticeQuestionCard } from '../components/Practice/PracticeQuestionCard';

export const PracticeTerminal: React.FC = () => {
  const { 
    questions, 
    currentIdx, 
    selectedOption, 
    isCorrect, 
    showExplanation, 
    isLoading,
    currentSubject,
    nextQuestion,
    prevQuestion,
    skipQuestion,
    selectOption,
    toggleExplanation
  } = usePractice();
  
  const navigate = useNavigate();

  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"
          />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Preparing Practice Environment...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Immersive Header */}
      <header className="px-8 py-6 md:px-12 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/practice')}
            className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-rose-500"
          >
            <X size={24} />
          </button>
          <div className="h-4 w-[2px] bg-slate-100 hidden sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Subject</h1>
            <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{currentSubject}</p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex-1 max-w-xl mx-12 hidden md:block">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
            <span>Progress: {Math.round(progress)}%</span>
            <span>{currentIdx + 1} / {questions.length} Questions</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-slate-50 text-slate-500 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
            <Maximize2 size={16} /> Zen Mode
          </button>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Study Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 self-center w-full max-w-7xl">
        <AnimatePresence mode="wait">
          <PracticeQuestionCard
            key={currentQ.id}
            index={currentIdx}
            question={currentQ}
            selectedOption={selectedOption}
            isCorrect={isCorrect}
            showExplanation={showExplanation}
            onSelect={selectOption}
          />
        </AnimatePresence>
      </main>

      {/* Control Dock (Sticky Bottom) */}
      <footer className="p-6 md:px-12 md:py-8 bg-white/80 backdrop-blur-md border-t border-slate-100 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <button 
              onClick={prevQuestion}
              disabled={currentIdx === 0}
              className="p-4 bg-slate-50 text-slate-400 rounded-[24px] hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={nextQuestion}
              disabled={currentIdx === questions.length - 1}
              className="p-4 bg-slate-50 text-slate-400 rounded-[24px] hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-center md:flex-none">
            <button 
              onClick={toggleExplanation}
              className={`flex items-center gap-2 px-8 py-4 rounded-[28px] text-sm font-black uppercase tracking-widest transition-all shadow-lg
                ${showExplanation 
                  ? "bg-indigo-600 text-white shadow-indigo-200" 
                  : "bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-200 shadow-slate-100"}
              `}
            >
              <Lightbulb size={20} /> {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>
            
            <button 
              onClick={skipQuestion}
              className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-500 rounded-[28px] text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-transparent shadow-lg shadow-slate-100"
            >
              <FastForward size={20} /> Skip
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
             <div className="h-10 w-[2px] bg-slate-100 mx-2" />
             <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</div>
                <div className="text-lg font-black text-emerald-500 leading-none">88%</div>
             </div>
             <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
               <MoreVertical size={20} />
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
