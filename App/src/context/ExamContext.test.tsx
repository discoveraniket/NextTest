import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamProvider, useExam } from './ExamContext';
import { type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

const mockSessionId = '00000000-0000-0000-0000-000000000001';
const mockQ1Id = '11111111-1111-1111-1111-111111111111';
const mockQ2Id = '22222222-2222-2222-2222-222222222222';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ExamProvider>{children}</ExamProvider>
);

describe('ExamContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful auth
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } });

    // Mock Database Responses
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { full_name: 'Test User' } }) }) })
        };
      }
      if (table === 'exam_sessions') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: {
                  id: mockSessionId,
                  year: 2024,
                  duration_minutes: 90,
                  correct_marks: 4,
                  negative_marks: 1,
                  exams: { name: 'Test Exam' }
                }
              })
            })
          })
        };
      }
      if (table === 'subjects') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: [
                  {
                    name: 'Math',
                    questions: [
                      { id: mockQ1Id, content: '1+1?', options: { A: '1', B: '2' }, correct_answer: 'B' },
                      { id: mockQ2Id, content: '2+2?', options: { A: '4', B: '5' }, correct_answer: 'A' }
                    ]
                  }
                ]
              })
            })
          })
        };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }) };
    });
  });

  it('should initialize with the first question', async () => {
    const { result } = renderHook(() => useExam(), { wrapper });
    
    await act(async () => {
      await result.current.initializeSession(mockSessionId);
    });

    expect(result.current.isInitialized).toBe(true);
    expect(result.current.currentIdx).toBe(0);
    expect(result.current.currentQuestion?.question_id).toBe(mockQ1Id);
    expect(result.current.examState[mockQ1Id].status).toBe('VISITED');
  });

  it('should navigate to next question and update status', async () => {
    const { result } = renderHook(() => useExam(), { wrapper });

    await act(async () => {
      await result.current.initializeSession(mockSessionId);
    });

    act(() => {
      result.current.goToQuestion(1);
    });

    expect(result.current.currentIdx).toBe(1);
    expect(result.current.currentQuestion?.question_id).toBe(mockQ2Id);
    expect(result.current.examState[mockQ2Id].status).toBe('VISITED');
  });

  it('should select an option and clear it', async () => {
    const { result } = renderHook(() => useExam(), { wrapper });

    await act(async () => {
      await result.current.initializeSession(mockSessionId);
    });

    act(() => {
      result.current.selectOption('B');
    });
    expect(result.current.examState[mockQ1Id].selectedOption).toBe('B');

    act(() => {
      result.current.clearResponse();
    });
    expect(result.current.examState[mockQ1Id].selectedOption).toBe(null);
  });

  it('should update status to ANSWERED when saved with option', async () => {
    const { result } = renderHook(() => useExam(), { wrapper });

    await act(async () => {
      await result.current.initializeSession(mockSessionId);
    });

    act(() => {
      result.current.selectOption('B');
      result.current.saveAndNext();
    });

    expect(result.current.examState[mockQ1Id].status).toBe('ANSWERED');
    expect(result.current.currentIdx).toBe(1);
  });

  it('should update status to MARKED when marked for review without option', async () => {
    const { result } = renderHook(() => useExam(), { wrapper });

    await act(async () => {
      await result.current.initializeSession(mockSessionId);
    });

    act(() => {
      result.current.markForReview();
    });

    expect(result.current.examState[mockQ1Id].status).toBe('MARKED');
  });

  it('should update status to ANSWERED_MARKED when marked for review with option', async () => {
    const { result } = renderHook(() => useExam(), { wrapper });

    await act(async () => {
      await result.current.initializeSession(mockSessionId);
    });

    act(() => {
      result.current.selectOption('A');
      result.current.markForReview();
    });

    expect(result.current.examState[mockQ1Id].status).toBe('ANSWERED_MARKED');
  });
});
