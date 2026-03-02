import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubjectStrip } from './SubjectStrip';

describe('SubjectStrip', () => {
  const subjects = ['Physics', 'Chemistry', 'Math'];
  const mockOnSubjectChange = vi.fn();

  it('should render all subjects', () => {
    render(
      <SubjectStrip 
        subjects={subjects} 
        currentActive="Physics" 
        onSubjectChange={mockOnSubjectChange} 
      />
    );

    subjects.forEach((subj) => {
      expect(screen.getByText(subj)).toBeInTheDocument();
    });
  });

  it('should highlight the active subject', () => {
    render(
      <SubjectStrip 
        subjects={subjects} 
        currentActive="Math" 
        onSubjectChange={mockOnSubjectChange} 
      />
    );

    const mathBtn = screen.getByText('Math');
    expect(mathBtn).toHaveClass('bg-white');
    expect(mathBtn).toHaveClass('text-primary-blue');
  });

  it('should call onSubjectChange when a subject is clicked', () => {
    render(
      <SubjectStrip 
        subjects={subjects} 
        currentActive="Physics" 
        onSubjectChange={mockOnSubjectChange} 
      />
    );

    const chemistryBtn = screen.getByText('Chemistry');
    fireEvent.click(chemistryBtn);
    
    expect(mockOnSubjectChange).toHaveBeenCalledWith('Chemistry');
  });
});
