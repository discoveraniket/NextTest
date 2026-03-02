import { useExam } from '../../context/ExamContext';
import { Check } from 'lucide-react';

export const StatusSummary = () => {
  const { examState, allQuestions } = useExam();

  const summary = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    marked: 0,
    answeredMarked: 0,
  };

  allQuestions.forEach((q) => {
    const state = examState[q.question.question_id];
    if (!state) return;

    switch (state.status) {
      case 'ANSWERED':
        summary.answered++;
        break;
      case 'VISITED':
        summary.notAnswered++;
        break;
      case 'NOT_VISITED':
        summary.notVisited++;
        break;
      case 'MARKED':
        summary.marked++;
        break;
      case 'ANSWERED_MARKED':
        summary.answeredMarked++;
        break;
    }
  });

  const items = [
    { label: 'Answered', count: summary.answered, color: 'bg-[#4caf50] text-white', icon: null },
    { label: 'Not Answered', count: summary.notAnswered, color: 'bg-[#f44336] text-white', icon: null },
    { label: 'Not Visited', count: summary.notVisited, color: 'bg-[#ffffff] border border-gray-300 text-black', icon: null },
    { label: 'Marked for Review', count: summary.marked, color: 'bg-[#9c27b0] text-white', icon: null },
    { 
      label: 'Answered & Marked for Review', 
      count: summary.answeredMarked, 
      color: 'bg-[#9c27b0] text-white relative', 
      icon: <Check className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white border border-white p-[1px]" strokeWidth={4} /> 
    },
  ];

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Question Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded shadow-sm flex-shrink-0 flex items-center justify-center text-[14px] font-bold border border-black/5 ${item.color}`}>
              {item.count}
              {item.icon}
            </div>
            <span className="text-[12px] font-medium leading-tight text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>

      <button 
        className="mt-2 w-full bg-[#f0f0f0] hover:bg-[#e0e0e0] text-gray-800 font-bold py-3 px-4 rounded border border-gray-300 shadow-sm transition-all text-sm uppercase tracking-wide cursor-pointer active:scale-95"
        onClick={() => {
          if (window.confirm("Are you sure you want to submit the exam?")) {
            alert("Exam Submitted successfully!");
          }
        }}
      >
        Submit
      </button>
    </div>
  );
};
