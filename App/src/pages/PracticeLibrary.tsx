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
  ArrowLeft,
  Book,
  Globe,
  Loader2
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

interface Subject {
  id: string;
  name: string;
}

export const PracticeLibrary: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startPractice } = usePractice();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await practiceDataService.getSubjects();
        if (Array.isArray(data)) {
           setSubjects(data);
        }
      } catch (err) {
        console.error("Critical Failure in Practice Library:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  const handleSubjectClick = async (subject: Subject) => {
    if (!subject?.id) return;
    await startPractice(subject.id);
    navigate('/practice/terminal');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-8 md:p-16 transition-colors duration-300">
      <header className="max-w-7xl mx-auto mb-16">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-indigo-600 font-bold text-sm mb-12 group transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4"
            >
              <div className="w-8 h-[1px] bg-indigo-600" />
              Dynamic Learning Laboratory
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-[var(--text-primary)] leading-tight tracking-tighter"
            >
              Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 underline decoration-indigo-200 decoration-8 underline-offset-4">Library</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[var(--text-secondary)] text-xl font-medium mt-6 max-w-2xl leading-relaxed"
            >
              Master every concept with live database questions. Learn with immediate feedback and high-fidelity explanations.
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-light)] shadow-sm">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px]">
                   <Globe size={14} /> All Banks
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors">
                   <Book size={14} /> Pinnacle Books
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-center justify-between border-b border-[var(--border-light)] pb-8">
           <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-4 lg:gap-6">
              <LayoutGrid size={24} className="text-indigo-600" /> Subject Domains
           </h3>
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-2xl py-4 pl-12 pr-6 w-80 shadow-sm focus:border-indigo-600 focus:outline-none transition-all placeholder:text-[var(--text-secondary)] font-medium text-sm"
              />
            </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 text-center">
             <Loader2 size={64} className="text-indigo-600 animate-spin mb-8 opacity-20" />
             <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight italic animate-pulse">Synchronizing Data...</h2>
             <p className="text-[var(--text-secondary)] font-medium mt-2">Connecting to live MCQ clusters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {subjects.map((subject, idx) => (
                <SubjectCard
                  key={subject.id}
                  title={subject.name}
                  icon={ICON_MAP[subject.name] || BookOpen}
                  count={1500} 
                  gradient={GRADIENTS[idx % GRADIENTS.length]}
                  onClick={() => handleSubjectClick(subject)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && subjects.length === 0 && (
          <div className="text-center py-48 bg-[var(--bg-card)] rounded-[40px] border border-dashed border-[var(--border-light)]">
             <Filter size={48} className="mx-auto text-[var(--text-secondary)] mb-6" />
             <p className="text-[var(--text-secondary)] text-xl font-bold italic">No subjects matching your criteria were found.</p>
          </div>
        )}
      </main>
    </div>
  );
};
