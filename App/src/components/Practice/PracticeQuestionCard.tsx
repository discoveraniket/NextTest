import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  Tags
} from "lucide-react";
import type { PinnacleQuestion } from "../../lib/practiceDataService";
import { usePractice } from "../../context/PracticeContext";

interface PracticeQuestionCardProps {
  question: PinnacleQuestion;
}

export const PracticeQuestionCard: React.FC<PracticeQuestionCardProps> = ({
  question,
}) => {
  const { selectOption, selectedOption, isCorrect, showExplanation } = usePractice();

  const options = [
    { key: "a", text: (question.options as any).a },
    { key: "b", text: (question.options as any).b },
    { key: "c", text: (question.options as any).c },
    { key: "d", text: (question.options as any).d },
  ];

  return (
    <div className="relative group">
      {/* Decorative Glows */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
      
      <div className="bg-white dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 shadow-xl dark:shadow-2xl overflow-hidden">
        
        {/* Taxonomy Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
           {(question.topic || question.subtopic) && (
             <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/10">
                <Tags size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{question.topic} {question.subtopic && `• ${question.subtopic}`}</span>
             </div>
           )}
           {question.metadata?.exam_info && (
             <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{question.metadata.exam_info}</span>
             </div>
           )}
        </div>

        {/* Question Content */}
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {question.content}
          </h1>
        </div>

        {/* Dynamic Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isCorrectOption = opt.key.toLowerCase() === question.correct_answer.toLowerCase();
            
            let statusStyles = "border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20";
            
            if (selectedOption) {
              if (isCorrectOption) {
                statusStyles = "border-[3px] border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]";
              } else if (isSelected && !isCorrect) {
                statusStyles = "border-[3px] border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)] opacity-80";
              } else {
                statusStyles = "border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 opacity-40 grayscale pointer-events-none";
              }
            }

            return (
              <motion.button
                key={opt.key}
                whileHover={!selectedOption ? { scale: 1.02 } : {}}
                whileTap={!selectedOption ? { scale: 0.98 } : {}}
                onClick={() => selectOption(opt.key)}
                className={`flex items-start gap-4 p-6 rounded-[32px] text-left transition-all relative group/opt overflow-hidden ${statusStyles}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black uppercase text-sm
                  ${isSelected ? 'bg-current text-white' : 'bg-slate-200 dark:bg-white/10 group-hover/opt:bg-slate-300 dark:group-hover/opt:bg-white/20'}`}>
                  {opt.key}
                </div>
                <span className="text-lg font-bold mt-0.5 leading-relaxed">
                  {opt.text}
                </span>

                {/* Status Icons */}
                {selectedOption && isCorrectOption && (
                  <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                )}
                {selectedOption && isSelected && !isCorrect && (
                  <XCircle className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-500" size={24} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Concept & Explanation Engine */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 40 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-[32px] p-8 border border-indigo-100 dark:border-indigo-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                     <Lightbulb size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">Concept & Facts</h3>
                    <p className="text-slate-500 text-xs mt-1 font-bold">In-depth Learning Insights</p>
                  </div>
                </div>
                {question.explanation && (
                  <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium">
                    {question.explanation}
                  </p>
                )}
                {!question.explanation && (
                  <p className="text-slate-500 italic text-lg">
                    No detailed explanation available for this concept yet.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
