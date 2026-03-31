import { motion } from 'framer-motion';
import { usePractice } from '../../context/PracticeContext';
import { CheckCircle, Circle, X } from 'lucide-react';

export const PracticeSidebar = () => {
  const { questions, currentIdx, history, jumpToQuestion } = usePractice();

  return (
    <motion.aside 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 border-l border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl hidden lg:flex flex-col h-full"
    >
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800 dark:text-white flex items-center gap-3">
          Progress <span className="text-indigo-600">Track</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Neural Question Matrix</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const result = history[q.id];
            const isCurrent = idx === currentIdx;
            
            return (
              <button
                key={q.id}
                onClick={() => jumpToQuestion(idx)}
                className={`
                  h-10 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer border
                  ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                  ${result 
                    ? result.correct 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-emerald-500"><CheckCircle size={12} /> Correct</span>
              <span className="text-slate-600 dark:text-slate-300">
                {Object.values(history).filter(h => h.correct).length}
              </span>
           </div>
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-rose-500"><X size={12} /> Errors</span>
              <span className="text-slate-600 dark:text-slate-300">
                {Object.values(history).filter(h => !h.correct).length}
              </span>
           </div>
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-slate-400"><Circle size={12} /> Remaining</span>
              <span className="text-slate-600 dark:text-slate-300">
                {questions.length - Object.keys(history).length}
              </span>
           </div>
        </div>
      </div>
    </motion.aside>
  );
};
