export interface OptionSet {
  [key: string]: string;
}

export interface Question {
  question_id: string | number;
  question: string;
  options: OptionSet;
  correct_answer: string;
}

export interface FlattenedQuestion {
  part: string;
  subject: string;
  question: Question;
}

export interface ExamData {
  exam_details: {
    name: string;
    year: string;
    duration_minutes: number;
    correct_answer_weightage: number;
    negative_marking: string;
  };
}

export type QuestionStatus = 
  | 'NOT_VISITED'
  | 'VISITED'
  | 'ANSWERED'
  | 'MARKED'
  | 'ANSWERED_MARKED';

export interface QuestionState {
  status: QuestionStatus;
  selectedOption: string | null;
}

export interface ExamState {
  [questionId: string]: QuestionState;
}
