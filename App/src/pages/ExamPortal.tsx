import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, PlayCircle, Clock, FileText, Loader2, ArrowLeft, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExamSession {
  id: string;
  year: number;
  duration_minutes: number;
  exams: {
    name: string;
  };
}

export const ExamPortal = () => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Only fetch exams with category != 'practice'
        const { data, error } = await supabase
          .from('exam_sessions')
          .select('id, year, duration_minutes, exams ( name, category )')
          .eq('is_active', true);

        if (error) throw error;
        
        // Filter out practice sessions from the UI
        const filtered = (data as any[]).filter(s => s.exams.category !== 'practice');
        setSessions(filtered);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
        <Loader2 className="animate-spin mr-3 text-indigo-600" size={32} />
        <span className="font-bold uppercase tracking-widest text-xs">Synchronizing Test Sets...</span>
      </div>
    );
  }

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
              className="flex items-center gap-2 text-rose-600 font-black uppercase tracking-[0.2em] text-xs mb-4"
            >
              <div className="w-8 h-[2px] bg-rose-600" />
              Strategic Portal
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-[var(--text-primary)] leading-tight tracking-tighter"
            >
              Exam <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 underline decoration-rose-200 decoration-8 underline-offset-4">Simulation</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[var(--text-secondary)] text-xl font-medium mt-6 max-w-2xl leading-relaxed"
            >
              Experience the pressure of real competitive exams in a timed, high-performance environment.
            </motion.p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sessions.map((session) => (
            <motion.div 
              key={session.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--bg-card)] rounded-3xl shadow-xl overflow-hidden border border-[var(--border-light)] flex flex-col group transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
                <div className="bg-rose-500/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 text-rose-400 border border-rose-500/10">Full Simulation</div>
                <h2 className="text-3xl font-black mb-1 leading-tight tracking-tight">{session.exams.name}</h2>
                <div className="flex items-center gap-2 text-sm opacity-60 font-bold uppercase tracking-widest mt-2">
                  <Calendar size={14} /> Session: {session.year}
                </div>
              </div>
              
              <div className="p-8 flex-1 bg-[var(--bg-card)]">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-light)] group-hover:bg-rose-50/30 group-hover:border-rose-100 transition-colors">
                    <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 flex items-center gap-1 group-hover:text-rose-400">
                      <Clock size={10} /> Time Limit
                    </div>
                    <div className="text-base font-black text-[var(--text-primary)] underline decoration-slate-200 decoration-2 underline-offset-4">{session.duration_minutes} Mins</div>
                  </div>
                  <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-light)] group-hover:bg-rose-50/30 group-hover:border-rose-100 transition-colors">
                    <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 flex items-center gap-1 group-hover:text-rose-400">
                      <FileText size={10} /> Mode
                    </div>
                    <div className="text-base font-black text-[var(--text-primary)] underline decoration-slate-200 decoration-2 underline-offset-4">Full CBT</div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/instructions/${session.id}`)}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all hover:bg-rose-600 active:scale-95 cursor-pointer shadow-slate-200 hover:shadow-rose-200"
                >
                  <PlayCircle size={24} /> Get Started
                </button>
              </div>
            </motion.div>
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full bg-[var(--bg-card)] p-24 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Trophy size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-6" />
              <p className="text-[var(--text-secondary)] text-xl font-bold italic">No examination sessions are currently active.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
