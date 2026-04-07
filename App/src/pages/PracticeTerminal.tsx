import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  ShieldCheck, 
  LayoutDashboard,
  Zap,
  Dices,
  Eye,
  EyeOff,
  Minimize2
} from 'lucide-react';
import { usePractice } from '../context/PracticeContext';
import { PracticeQuestionCard } from '../components/Practice/PracticeQuestionCard';
import { PracticeSidebar } from '../components/Practice/PracticeSidebar';

export const PracticeTerminal = () => {
  const navigate = useNavigate();
  const { 
    questions, 
    currentIdx, 
    nextQuestion, 
    prevQuestion, 
    isRandomized,
    toggleRandomize,
    showExplanation,
    toggleExplanation
  } = usePractice();

  const [isZenMode, setIsZenMode] = useState(false);
  const currentQuestion = questions[currentIdx];

  // Progress Calculation
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center text-[var(--text-primary)]">
        <Zap className="mb-6 text-indigo-500 animate-pulse" size={64} />
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Initialising Neural Link...</h2>
        <p className="text-[var(--text-secondary)] font-bold mt-4">Connecting to Master Question Cluster</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-700 font-sans overflow-hidden ${
      isZenMode 
        ? 'bg-slate-950 text-white dark' 
        : 'bg-[var(--bg-main)] text-[var(--text-primary)]'
    }`}>
      
      {/* Dynamic Header (hidden in Zen) */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ ease: "circOut", duration: 0.8 }}
            className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm"
          >
            <div className="flex items-center gap-8">
              <button 
                onClick={() => navigate('/practice')}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group flex items-center gap-2 cursor-pointer"
              >
                <X size={20} className="text-slate-400 group-hover:text-rose-500 group-hover:rotate-90 transition-all duration-500" />
              </button>
              
              <div className="h-8 w-[2px] bg-slate-100 dark:bg-slate-800 hidden sm:block" />
              
              <div className="hidden lg:flex flex-col">
                <div className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mb-1">Session Protocol</div>
                <div className="text-sm font-black tracking-tight flex items-center gap-2">
                  <LayoutDashboard size={16} className="text-slate-400" /> Clinical Mode: <span className="text-indigo-600 dark:text-indigo-400 uppercase italic">Active</span>
                </div>
              </div>
            </div>

             {/* Central Progress Core */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                 <span className="hidden sm:inline">Question </span>{currentIdx + 1}/{questions.length}
               </div>
               <div className="w-24 sm:w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
               </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 hidden md:flex items-center gap-2" title="Analytics Logging Active">
                <ShieldCheck size={14} /> Mastery Engine Active
              </div>
              <button 
                 onClick={() => setIsZenMode(true)}
                 className="p-3 bg-slate-900 text-white dark:bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 px-6"
              >
                <Maximize2 size={18} /> <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Zen Mode</span>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <main className={`flex transition-all duration-1000 ${isZenMode ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
        
        {/* Navigation - Left Control */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.aside 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-24 border-r border-slate-100 dark:border-slate-800 hidden xl:flex flex-col items-center py-12 gap-8"
            >
              <nav className="flex flex-col gap-6">
                <button 
                  onClick={prevQuestion}
                  disabled={currentIdx === 0}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-30 transition-all cursor-pointer shadow-sm group"
                >
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                   onClick={nextQuestion}
                   disabled={currentIdx === questions.length - 1}
                   className="p-5 bg-indigo-600 text-white rounded-3xl hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-500/30 group"
                >
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </nav>

              <div className="w-10 h-[1px] bg-slate-100 dark:bg-slate-800" />
              
              <button 
                onClick={toggleRandomize}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group ${
                  isRandomized 
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
                title="Randomize Sequences"
              >
                <Dices size={24} className={isRandomized ? 'animate-spin-slow' : ''} />
              </button>

              <button 
                onClick={toggleExplanation}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group ${
                  showExplanation 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
                title="Toggle Explanation Auto-Reveal"
              >
                {showExplanation ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Portal */}
        <section className={`flex-1 overflow-y-auto transition-all duration-1000 scrollbar-hide w-full ${
          isZenMode ? 'flex items-center justify-center p-4 sm:p-8' : 'p-4 sm:p-8 md:p-12 xl:p-24'
        }`}>
          <div className={`mx-auto transition-all duration-1000 ${isZenMode ? 'max-w-4xl w-full' : 'max-w-5xl'}`}>
            <PracticeQuestionCard question={currentQuestion} />
            
            {/* Quick Navigation Footer (Visible in standard view) */}
            {!isZenMode && (
              <div className="mt-8 xl:mt-20">
                {/* Mobile / Tablet Navigation Control Bar */}
                <div className="flex xl:hidden flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex gap-3">
                    <button 
                      onClick={prevQuestion} 
                      disabled={currentIdx === 0} 
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <button 
                      onClick={nextQuestion} 
                      disabled={currentIdx === questions.length - 1} 
                      className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={toggleRandomize} 
                      className={`p-3 rounded-xl border transition-colors ${
                        isRandomized ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'
                      }`}
                    >
                      <Dices size={20} className={isRandomized ? 'animate-spin-slow' : ''} />
                    </button>
                    <button 
                      onClick={toggleExplanation} 
                      className={`p-3 rounded-xl border transition-colors ${
                        showExplanation ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'
                      }`}
                    >
                      {showExplanation ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                {/* Desktop Meta Info */}
                <div className="flex justify-between items-center text-slate-400">
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-60">Source Link</span>
                        <span className="text-sm font-bold truncate max-w-[200px]">Pinnacle SSC G.K 6500+</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sequence Protocol</span>
                      <span className="text-sm font-bold text-indigo-600 italic">
                        {isRandomized ? 'NEURAL SHUFFLE ACTIVE' : 'CHRONOLOGICAL FLOW'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Action Panel Sidebar (hidden in Zen) */}
        {!isZenMode && <PracticeSidebar />}

        {/* Zen Floating Controls */}
        <AnimatePresence>
          {isZenMode && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-6 bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-full shadow-3xl z-[100]"
            >
              <button 
                onClick={prevQuestion}
                className="p-3 hover:bg-white/10 rounded-xl transition-all"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>

              <div className="h-8 w-[1px] bg-white/10" />
              
              <div className="flex flex-col items-center">
                 <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Concentration</div>
                 <div className="text-sm font-bold text-white tracking-widest">Question {currentIdx + 1}</div>
              </div>

              <div className="h-8 w-[1px] bg-white/10" />

              <button 
                onClick={nextQuestion}
                className="p-3 hover:bg-white/10 rounded-xl transition-all"
              >
                <ChevronRight size={24} className="text-white" />
              </button>

              <button 
                onClick={() => setIsZenMode(false)}
                className="ml-4 p-4 bg-white/10 hover:bg-rose-500 rounded-full transition-all text-white group"
                title="Exit Zen Mode"
              >
                <Minimize2 size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
