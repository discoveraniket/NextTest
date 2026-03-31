import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Calculator, 
  Trophy, 
  Search,
  LayoutGrid,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { usePractice } from '../context/PracticeContext';
import { SubjectCard } from '../components/Practice/SubjectCard';
import { practiceDataService } from '../lib/practiceDataService';

const ICON_MAP: { [key: string]: any } = {
  'STATIC G.K.': BookOpen,
  'Mathematics': Calculator,
  'Reasoning': Brain,
  'General Science': Trophy,
};

const GRADIENTS = [
  'bg-gradient-to-br from-indigo-500 to-purple-600',
  'bg-gradient-to-br from-rose-500 to-orange-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-blue-500 to-indigo-600',
];

export const PracticeLibrary: React.FC = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const { startPractice } = usePractice();
  const navigate = useNavigate();

  useEffect(() => {
    practiceDataService.getSubjects().then(setSubjects);
  }, []);

  const handleSubjectClick = async (subject: string) => {
    await startPractice(subject);
    navigate('/practice/terminal');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 md:p-16">
      <header className="max-w-7xl mx-auto mb-16">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-12 group transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-4"
            >
              <div className="w-8 h-[2px] bg-indigo-600" />
              Learning Portal
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter"
            >
              Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 underline decoration-indigo-200 decoration-8 underline-offset-4">Library</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-xl font-medium mt-6 max-w-2xl leading-relaxed"
            >
              Master every subject with our comprehensive MCQ databases. Learn with instant feedback and detailed explanations.
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 w-80 shadow-sm focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
              />
            </div>
            <button className="bg-white p-4 rounded-2xl border-2 border-slate-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
              <Filter size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {subjects.map((subject, idx) => (
              <SubjectCard
                key={subject}
                title={subject}
                icon={ICON_MAP[subject] || BookOpen}
                count={1500} // Placeholder count
                gradient={GRADIENTS[idx % GRADIENTS.length]}
                onClick={() => handleSubjectClick(subject)}
              />
            ))}
          </AnimatePresence>
        </div>

        {subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <LayoutGrid size={64} className="mb-6 opacity-20" />
            <p className="text-xl font-bold uppercase tracking-widest italic">Loading Your Library...</p>
          </div>
        )}
      </main>
    </div>
  );
};
