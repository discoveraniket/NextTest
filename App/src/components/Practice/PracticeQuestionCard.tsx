import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Bookmark, Share2 } from 'lucide-react';
import type { PinnacleQuestion } from '../../lib/practiceDataService';

interface PracticeQuestionCardProps {
  question: PinnacleQuestion;
  selectedOption: string | null;
  isCorrect: boolean | null;
  showExplanation: boolean;
  onSelect: (option: string) => void;
  index: number;
}

export const PracticeQuestionCard: React.FC<PracticeQuestionCardProps> = ({
  question,
  selectedOption,
  isCorrect,
  showExplanation,
  onSelect,
  index,
}) => {
  const options = question.options;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="max-w-4xl mx-auto w-full"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl p-10 md:p-16 relative overflow-hidden">
        {/* Aesthetic Background Detail */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        {/* Header/Tags */}
        <div className="flex items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
              Question {index + 1}
            </div>
            {question.exam_info && (
              <div className="bg-slate-100 text-slate-500 px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                {question.exam_info}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <button className="hover:text-indigo-600 transition-colors"><Bookmark size={20} /></button>
            <button className="hover:text-indigo-600 transition-colors"><Share2 size={20} /></button>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-12 tracking-tight">
          {question.question}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-5 mb-12">
          {Object.entries(options).map(([key, value]) => {
            const isSelected = selectedOption === key;
            const isCorrectOption = key.toLowerCase() === question.answer.toLowerCase();
            
            let statusClasses = "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50";
            if (isSelected) {
              statusClasses = isCorrect 
                ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100 ring-2 ring-emerald-500/20" 
                : "border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-100 ring-2 ring-rose-500/20";
            } else if (showExplanation && isCorrectOption) {
              statusClasses = "border-emerald-500 bg-emerald-50/50";
            }

            return (
              <motion.button
                key={key}
                whileHover={!selectedOption ? { x: 8 } : {}}
                whileTap={!selectedOption ? { scale: 0.98 } : {}}
                disabled={!!selectedOption}
                onClick={() => onSelect(key)}
                className={`flex items-center gap-6 p-6 md:p-8 rounded-3xl border-2 transition-all text-left group ${statusClasses}`}
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black uppercase transition-all
                  ${isSelected
                    ? (isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")
                    : (showExplanation && isCorrectOption ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white")
                  }
                `}>
                  {key}
                </div>
                <div className={`flex-1 text-lg font-semibold ${isSelected ? (isCorrect ? "text-emerald-700" : "text-rose-700") : "text-slate-600"}`}>
                  {value}
                </div>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation Section */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0, mt: 0 }}
              animate={{ opacity: 1, height: 'auto', mt: 40 }}
              exit={{ opacity: 0, height: 0, mt: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-indigo-50/50 rounded-3xl p-8 md:p-10 border border-indigo-100">
                <div className="flex items-center gap-3 mb-6 text-indigo-700 font-black uppercase tracking-widest text-xs">
                  <Info size={16} /> Concept & Explanation
                </div>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  {question.explanation}
                </p>
                {!isCorrect && selectedOption && (
                   <div className="mt-6 pt-6 border-t border-indigo-100 flex items-center gap-2">
                     <span className="text-sm font-bold text-slate-400">CORRECT ANSWER IS:</span>
                     <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-black uppercase">{question.answer}</span>
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
