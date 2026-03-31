import { supabase } from './supabase';

export interface PinnacleQuestion {
  id: string;
  content: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_answer: string;
  explanation: string | null;
  topic?: string | null;
  subtopic?: string | null;
  metadata?: any;
}

class PracticeDataService {
  async getSubjects(): Promise<{ id: string; name: string }[]> {
    try {
      // Use maybeSingle to avoid exceptions if result is empty or multiple
      const { data: examData } = await supabase
        .from('exams')
        .select('id')
        .eq('name', 'General Practice')
        .maybeSingle();

      if (!examData) {
        console.warn('Practice Exam not found in database.');
        return [];
      }

      const { data: sessionData } = await supabase
        .from('exam_sessions')
        .select('id')
        .eq('exam_id', examData.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!sessionData) {
        console.warn('Active Practice Session not found.');
        return [];
      }

      const { data: subjects, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('session_id', sessionData.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return subjects || [];
    } catch (err) {
      console.error('getSubjects critical failure:', err);
      return [];
    }
  }

  async getQuestionsBySubject(subjectId: string): Promise<PinnacleQuestion[]> {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching practice questions:', error);
      return [];
    }

    return (questions || []) as PinnacleQuestion[];
  }

  async getTopicsForSubject(subjectId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('topic')
      .eq('subject_id', subjectId)
      .not('topic', 'is', null);

    if (error) {
      console.error('Error fetching topics:', error);
      return [];
    }

    const uniqueTopics = Array.from(new Set(data.map(q => q.topic))).filter(Boolean) as string[];
    return uniqueTopics;
  }

  async logInteraction(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    option: string,
    timeOnQuestion: number,
    timeOnExplanation: number
  ) {
    const { error } = await supabase.from('practice_telemetry').insert({
      user_id: userId,
      question_id: questionId,
      is_correct: isCorrect,
      selected_option: option,
      time_on_question_ms: timeOnQuestion,
      time_on_explanation_ms: timeOnExplanation,
      interaction_type: 'answer'
    });

    if (error) console.error('Error logging telemetry:', error);
  }
}

export const practiceDataService = new PracticeDataService();
