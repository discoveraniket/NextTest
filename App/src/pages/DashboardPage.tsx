import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, PlayCircle, Clock, FileText, UserCircle, Loader2 } from 'lucide-react';

interface ExamSession {
  id: string;
  year: number;
  duration_minutes: number;
  exams: {
    name: string;
  };
}

export const DashboardPage = () => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          year,
          duration_minutes,
          exams ( name )
        `)
        .eq('is_active', true);

      if (!error && data) {
        setSessions(data as any);
      }
      setLoading(false);
    };

    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* Top Navbar */}
      <nav className="bg-primary-blue text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-lg">
        <div className="text-xl font-black uppercase tracking-tighter italic">NexTest Dashboard</div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold leading-none">Joymalya Majee</div>
            <div className="text-[10px] opacity-70">000-420</div>
          </div>
          <UserCircle size={32} className="opacity-90" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-gray-800 uppercase">Available Examinations</h1>
          <p className="text-gray-500 font-medium">Select an exam to begin your session.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-blue" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <p className="text-gray-400 italic">No active exams found in the database.</p>
            )}
          </div>
        )}

        <div className="mt-20 p-8 bg-white/50 rounded-2xl border border-gray-200">
          <h3 className="font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText size={16} /> Recent Performance History
          </h3>
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm italic">No recent attempts found. Start an exam to track your progress.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
