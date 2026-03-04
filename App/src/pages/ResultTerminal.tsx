import { useState, useMemo } from 'react';
import { useExam } from '../context/ExamContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Award, 
  BarChart3, 
  Clock, 
  LayoutDashboard, 
  ClipboardCheck, 
  ListChecks
} from 'lucide-react';

export const ResultTerminal = () => {
  const { examData, allQuestions, examState, resetExam } = useExam();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');

  const handleRestart = () => {
    resetExam();
    navigate('/exam/1');
  };

  const handleDashboard = () => {
    resetExam();
    navigate('/dashboard');
  };

  // --- Calculations ---
  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const subjectStats: Record<string, { correct: number; incorrect: number; total: number }> = {};

    allQuestions.forEach(({ subject, question }) => {
      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, incorrect: 0, total: 0 };
      }
      subjectStats[subject].total++;

      const state = examState[question.question_id];
      if (state?.selectedOption) {
        if (state.selectedOption === question.correct_answer) {
          correct++;
          subjectStats[subject].correct++;
        } else {
          incorrect++;
          subjectStats[subject].incorrect++;
        }
      } else {
        unattempted++;
      }
    });

    const correctMarks = examData.exam_details.correct_answer_weightage;
    const negativeMarking = parseFloat(examData.exam_details.negative_marking);
    const totalScore = (correct * correctMarks) - (incorrect * negativeMarking);
    const maxScore = allQuestions.length * correctMarks;
    const percentage = ((totalScore / maxScore) * 100).toFixed(2);

    return { correct, incorrect, unattempted, totalScore, maxScore, percentage, subjectStats };
  }, [allQuestions, examState, examData]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans result-page overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-primary-blue text-white py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic mb-2">Examination Report</h1>
            <p className="opacity-80 font-medium">Candidate: Joymalya Majee | Roll: 000-420</p>
            <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded text-xs font-bold uppercase tracking-widest border border-white/30">
              {examData.exam_details.name}
            </div>
          </div>
          <div className="bg-white text-primary-blue p-6 rounded-2xl shadow-2xl text-center min-w-[180px]">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Final Score</div>
            <div className="text-5xl font-black">{stats.totalScore}<span className="text-xl text-gray-300">/{stats.maxScore}</span></div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto -mt-8 px-4 pb-20">
        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white p-2 rounded-t-2xl shadow-md border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all cursor-pointer
              ${activeTab === 'summary' ? 'bg-primary-blue text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ClipboardCheck size={18} /> Scorecard
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all cursor-pointer
              ${activeTab === 'details' ? 'bg-primary-blue text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ListChecks size={18} /> Question Paper
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-10 border border-gray-100 min-h-[400px]">
          {activeTab === 'summary' ? (
            <div className="animate-in fade-in duration-300">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <MiniStat label="Accuracy" value={`${stats.percentage}%`} icon={<Award className="text-yellow-500" />} />
                <MiniStat label="Correct" value={stats.correct} icon={<CheckCircle className="text-green-500" />} />
                <MiniStat label="Incorrect" value={stats.incorrect} icon={<XCircle className="text-red-500" />} />
                <MiniStat label="Skipped" value={stats.unattempted} icon={<MinusCircle className="text-gray-400" />} />
              </div>

              {/* Subject Wise Analysis */}
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                <BarChart3 className="text-primary-blue" size={20} /> Subject-wise Performance
              </h3>
              <div className="overflow-hidden border border-gray-100 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Correct</th>
                      <th className="px-6 py-4">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(stats.subjectStats).map(([subj, s]) => (
                      <tr key={subj} className="text-sm">
                        <td className="px-6 py-4 font-bold text-gray-700">{subj}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{s.total}</td>
                        <td className="px-6 py-4 text-green-600 font-bold">{s.correct}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-blue" 
                                style={{ width: `${(s.correct / s.total) * 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-400 text-xs">{((s.correct / s.total) * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Response</th>
                      <th className="px-6 py-4">Correct</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allQuestions.map(({ subject, question }, idx) => {
                      const state = examState[question.question_id];
                      const isCorrect = state?.selectedOption === question.correct_answer;
                      const isUnattempted = !state?.selectedOption;

                      return (
                        <tr key={question.question_id} className="text-sm">
                          <td className="px-6 py-4 font-black text-gray-300">{idx + 1}</td>
                          <td className="px-6 py-4 font-bold text-gray-600">{subject}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded font-mono font-bold ${isUnattempted ? 'text-gray-300' : isCorrect ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                              {state?.selectedOption || '--'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-primary-blue">{question.correct_answer}</td>
                          <td className="px-6 py-4 uppercase text-[10px] font-black tracking-widest">
                            {isUnattempted ? (
                              <span className="text-gray-400">Skipped</span>
                            ) : isCorrect ? (
                              <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Correct</span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1"><XCircle size={12} /> Wrong</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Persistent Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-gray-100">
            <button 
              onClick={handleDashboard} 
              className="bg-white text-gray-500 border-2 border-gray-100 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} /> Exit to Dashboard
            </button>
            <button 
              onClick={handleRestart} 
              className="bg-primary-blue text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock size={18} /> Re-Attempt Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-xl font-black text-gray-800">{value}</div>
  </div>
);
