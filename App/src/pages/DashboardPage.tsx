import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  UserCircle, 
  Loader2, 
  LogOut, 
  Brain, 
  Target, 
  PlayCircle,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  full_name: string;
}

interface AttemptHistory {
  id: string;
  total_score: number;
  completed_at: string;
  exam_sessions: {
    year: number;
    exams: { name: string };
  };
}

import { ThemeToggle } from '../components/ThemeToggle';

export const DashboardPage = () => {
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      try {
        const [profileRes, attemptsRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', session.user.id).single(),
          supabase.from('attempts')
            .select(`
              id, 
              total_score, 
              completed_at,
              exam_sessions (
                year,
                exams ( name )
              )
            `)
            .eq('user_id', session.user.id)
            .order('completed_at', { ascending: false })
            .limit(5)
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (attemptsRes.data) setAttempts(attemptsRes.data as any);
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
        <Loader2 className="animate-spin mr-3 text-indigo-600" size={32} />
        <span className="font-bold uppercase tracking-widest text-xs">Authenticating Portal...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-sans pb-24 transition-colors duration-300">
      {/* Premium Navbar */}
      <nav className="bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-light)] py-6 px-8 md:px-16 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Brain size={24} className="text-white" />
          </div>
          <div className="text-xl font-black uppercase tracking-tighter italic text-[var(--text-primary)] leading-none">NexTest <span className="text-indigo-600 text-xs align-top font-bold uppercase not-italic tracking-widest ml-1">LITE</span></div>
        </div>
        
        <div className="flex items-center gap-8">
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Active User</div>
              <div className="text-sm font-black text-[var(--text-primary)] leading-none">{profile?.full_name || 'NexTest User'}</div>
            </div>
            <UserCircle size={40} className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all cursor-pointer shadow-sm shadow-rose-500/10 active:scale-90"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 md:p-16">
        <div className="mb-16">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4"
           >
             <div className="w-8 h-[1px] bg-indigo-600" />
             Strategic Dashboard
           </motion.div>
           <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] leading-tight tracking-tighter">
             Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600">{profile?.full_name.split(' ')[0] || 'Scholar'}.</span>
           </h1>
           <p className="text-[var(--text-secondary)] text-xl font-medium mt-4 max-w-xl">Choose your active track to start improving your score today.</p>
        </div>

        {/* The Two Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
           {/* PORTAL 1: PRACTICE */}
           <motion.div 
             whileHover={{ y: -8 }}
             onClick={() => navigate('/practice')}
             className="relative group cursor-pointer"
           >
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-600/10 to-indigo-400/5 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="relative bg-[var(--bg-card)] rounded-[48px] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-[var(--border-light)] group-hover:border-indigo-100 overflow-hidden transition-all">
                 <div className="absolute top-0 right-0 p-8 text-indigo-100 group-hover:text-indigo-600 transition-all duration-700">
                    <Brain size={120} strokeWidth={1} />
                 </div>
                 
                 <div className="bg-indigo-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white mb-10 shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-500">
                    <PlayCircle size={32} />
                 </div>
                 <div className="relative">
                    <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tight">MCQ Practice <span className="text-indigo-600">Lab</span>.</h2>
                    <p className="text-[var(--text-secondary)] text-lg font-medium leading-relaxed max-w-sm mb-10">Subject-wise mastery with instant feedback and AI-ready telemetry analytics.</p>
                    <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-sm group-hover:gap-6 transition-all">
                       Enter Laboratory <ArrowRight size={20} />
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* PORTAL 2: EXAMS */}
           <motion.div 
             whileHover={{ y: -8 }}
             onClick={() => navigate('/exams')}
             className="relative group cursor-pointer"
           >
              <div className="absolute -inset-4 bg-gradient-to-br from-rose-600/10 to-rose-400/5 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="relative bg-[var(--bg-card)] rounded-[48px] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-[var(--border-light)] group-hover:border-rose-100 overflow-hidden transition-all">
                 <div className="absolute top-0 right-0 p-8 text-rose-100 group-hover:text-rose-600 transition-all duration-700">
                    <Target size={120} strokeWidth={1} />
                 </div>
                 
                 <div className="bg-rose-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white mb-10 shadow-xl shadow-rose-600/30 group-hover:scale-110 transition-transform duration-500">
                    <Activity size={32} />
                 </div>
                 <div className="relative">
                    <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tight">Exam <span className="text-rose-600">Portal</span>.</h2>
                    <p className="text-[var(--text-secondary)] text-lg font-medium leading-relaxed max-w-sm mb-10">Real-time assessment simulations with strict timing and official marking schemes.</p>
                    <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-widest text-sm group-hover:gap-6 transition-all">
                       Browse Examinations <ArrowRight size={20} />
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* History Section */}
        <div className="bg-[var(--bg-card)] rounded-[56px] p-8 md:p-16 overflow-hidden relative shadow-3xl border border-[var(--border-light)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] -z-0" />
          
          <div className="relative z-10">
            <h3 className="font-black text-[var(--text-primary)] text-3xl mb-12 flex items-center gap-4 uppercase tracking-tighter italic">
              <FileText size={32} className="text-rose-500" /> Performance History
            </h3>
            
            {attempts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="bg-[var(--bg-main)] border border-[var(--border-light)] p-8 rounded-[32px] hover:bg-indigo-500/5 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <div className="text-[var(--text-primary)] text-2xl font-black mb-1">{attempt.exam_sessions.exams.name}</div>
                          <div className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">{attempt.exam_sessions.year} Session</div>
                       </div>
                       <div className="bg-emerald-500/10 text-emerald-500 px-5 py-2 rounded-2xl font-black text-xs border border-emerald-500/10">
                         {attempt.total_score} Points
                       </div>
                    </div>
                    <div className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">
                       Completed: {new Date(attempt.completed_at).toLocaleDateString(undefined, {
                         day: 'numeric', month: 'short', year: 'numeric'
                       })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[var(--bg-main)] rounded-[40px] border border-[var(--border-light)] border-dashed">
                <p className="text-[var(--text-secondary)] text-xl font-bold italic">No active track records found. Start exploring to build your history.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
