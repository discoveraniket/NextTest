import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Info, CheckCircle2, Loader2 } from 'lucide-react';

interface SessionInfo {
  id: string;
  correct_marks: number;
  negative_marks: number;
  exams: { name: string };
}

export const InstructionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('id, correct_marks, negative_marks, exams(name)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setSession(data as any);
      }
      setLoading(false);
    };

    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="animate-spin text-primary-blue" size={40} />
      </div>
    );
  }

  if (!session) return <div>Session not found</div>;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-primary-blue text-white py-4 px-6 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-tight italic">Candidate Instructions</h1>
        <div className="text-xs bg-white/20 px-3 py-1 rounded font-bold uppercase">{session.exams.name}</div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="bg-blue-50 border-l-4 border-primary-blue p-6 rounded-r-xl mb-10 flex gap-4 items-start shadow-sm">
          <Info className="text-primary-blue flex-shrink-0" />
          <div>
            <h2 className="font-black text-primary-blue uppercase text-sm mb-1 tracking-wider">General Information</h2>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Please read the following instructions carefully. These instructions apply to the <span className="font-bold underline italic text-blue-900">{session.exams.name}</span> session.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h3 className="font-black text-gray-800 uppercase text-lg border-b-2 border-gray-100 pb-2 mb-6 tracking-tight flex items-center gap-2">
              <span className="bg-primary-blue text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
              Standard Interface Navigation
            </h3>
            <ul className="space-y-4">
              <InstructionItem 
                title="Question Palette" 
                text="The question palette on the right side will show the status of each question using color codes." 
              />
              <InstructionItem 
                title="Save & Next" 
                text="You must click 'Save & Next' to record your response for any question." 
              />
              <InstructionItem 
                title="Review Mode" 
                text="You can mark questions for review if you are unsure; these will appear purple in the palette." 
              />
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="font-black text-gray-800 uppercase text-lg border-b-2 border-gray-100 pb-2 mb-6 tracking-tight flex items-center gap-2">
              <span className="bg-primary-blue text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
              Marking Scheme & Duration
            </h3>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <span className="text-sm font-bold text-gray-700 underline decoration-green-500/30">Correct Answer: +{session.correct_marks} Marks</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-red-500" />
                <span className="text-sm font-bold text-gray-700 underline decoration-red-500/30">Negative Marking: {session.negative_marks} Marks</span>
              </div>
            </div>
          </section>

          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center shadow-inner">
            <p className="text-sm text-red-700 font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={18} /> Proctored Environment Active
            </p>
            <p className="text-[10px] text-red-400 mt-1 uppercase font-bold tracking-tighter">Your session activity is being logged for audit and security purposes.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 pt-10">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-500 rounded-xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel & Go Back
            </button>
            <button 
              onClick={() => navigate(`/exam/${session.id}`)}
              className="flex-1 py-4 px-6 bg-primary-blue text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={20} /> I AM READY TO BEGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstructionItem = ({ title, text }: { title: string, text: string }) => (
  <li className="flex gap-4">
    <div className="w-2 h-2 bg-primary-blue rounded-full mt-2 flex-shrink-0" />
    <div className="text-sm">
      <span className="font-black text-gray-800 uppercase text-xs tracking-wide">{title}: </span>
      <span className="text-gray-600 font-medium">{text}</span>
    </div>
  </li>
);
