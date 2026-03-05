import React from 'react';
import { useExam } from '../../context/ExamContext';
import { CandidateProfile } from '../CandidateProfile/CandidateProfile';
import { QuestionGrid } from '../QuestionGrid/QuestionGrid';
import { StatusSummary } from '../StatusSummary/StatusSummary';

export const PaletteSidebar: React.FC = () => {
  const { 
    currentPart, 
    currentSubject, 
    allQuestions, 
    examState, 
    goToQuestion,
    userProfile
  } = useExam();

  return (
    <aside className="w-full md:w-[350px] flex flex-col bg-sidebar-bg border-l border-border-color h-auto md:h-full overflow-hidden">
      <CandidateProfile name={userProfile?.full_name || 'Candidate'} />
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div className="bg-primary-blue text-white py-2 px-4 rounded shadow-sm text-sm font-medium">
          {currentPart} - {currentSubject}
        </div>
        
        <QuestionGrid 
          currentPart={currentPart}
          currentSubject={currentSubject}
          allQuestions={allQuestions}
          examState={examState}
          onGoTo={goToQuestion}
        />

        <div className="mt-auto pt-6 border-t border-gray-100">
          <StatusSummary />
        </div>
      </div>
    </aside>
  );
};
