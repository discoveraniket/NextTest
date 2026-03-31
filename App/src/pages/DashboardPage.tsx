import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, PlayCircle, Clock, FileText, UserCircle, Loader2, LogOut, Brain, LayoutGrid, Trophy } from 'lucide-react';

interface ExamSession {
  id: string;
  year: number;
  duration_minutes: number;
  exams: {
    name: string;
  };
}

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

export const DashboardPage = () => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initDashboard = async () => {
      // 1. Check Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // 2. Fetch Profile, Sessions & Attempts
      try {
        const [profileRes, sessionsRes, attemptsRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', session.user.id).single(),
          supabase.from('exam_sessions').select('id, year, duration_minutes, exams ( name )').eq('is_active', true),
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
        if (sessionsRes.data) setSessions(sessionsRes.data as any);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-blue mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* Top Navbar */}
      <nav className="bg-primary-blue text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="text-xl font-black uppercase tracking-tighter italic">NexTest Dashboard</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold leading-none">{profile?.full_name || 'Anonymous User'}</div>
            </div>
            <UserCircle size={32} className="opacity-90" />
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Available Examinations</h1>
          <p className="text-gray-500 font-medium">Select an exam to begin your session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Practice MCQ Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col group transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
              <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">Learning Portal</div>
              <h2 className="text-2xl font-black mb-1 leading-tight">MCQ Practice Laboratory</h2>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Brain size={14} /> Subject-wise Practice
              </div>
            </div>
            
            <div className="p-6 flex-1 bg-white">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <LayoutGrid size={10} /> Mode
                  </div>
                  <div className="text-sm font-bold text-gray-700">Adaptive Learning</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Trophy size={10} /> Goal
                  </div>
                  <div className="text-sm font-bold text-gray-700">Concept Mastery</div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/practice')}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:bg-indigo-700 active:scale-95 cursor-pointer"
              >
                <PlayCircle size={20} /> Enter Practice Mode
              </button>
            </div>
          </div>

          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col group transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="bg-gradient-to-br from-primary-blue to-blue-800 p-6 text-white">
                <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">Assessment Available</div>
                <h2 className="text-2xl font-black mb-1 leading-tight">{session.exams.name}</h2>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <Calendar size={14} /> Year: {session.year}
                </div>
              </div>
              
              <div className="p-6 flex-1 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Clock size={10} /> Duration
                    </div>
                    <div className="text-sm font-bold text-gray-700">{session.duration_minutes} Minutes</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                      <FileText size={10} /> Mode
                    </div>
                    <div className="text-sm font-bold text-gray-700">Online CBT</div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/instructions/${session.id}`)}
                  className="w-full bg-primary-blue text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all group-hover:bg-blue-700 active:scale-95 cursor-pointer"
                >
                  <PlayCircle size={20} /> Start Examination
                </button>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <p className="text-gray-400 italic">No active exams found in the database.</p>
            </div>
          )}
        </div>

        <div className="mt-20 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-2">
            <FileText size={20} className="text-primary-blue" /> Recent Performance History
          </h3>
          
          {attempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-4 py-3">Examination</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="text-sm hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-700">{attempt.exam_sessions.exams.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{attempt.exam_sessions.year} Session</div>
                      </td>
                      <td className="px-4 py-4 text-gray-500 font-medium">
                        {new Date(attempt.completed_at).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-blue-50 text-primary-blue px-3 py-1 rounded-full font-black text-xs">
                          {attempt.total_score} Points
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm italic">No recent attempts found. Start an exam to track your progress.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
