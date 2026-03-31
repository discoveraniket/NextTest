export interface PinnacleQuestion {
  id: number;
  question: string;
  exam_info: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: string;
  explanation: string;
}

export interface PinnacleData {
  metadata: any;
  content: {
    [subject: string]: {
      [topic: string]: {
        [page: string]: PinnacleQuestion[];
      };
    };
  };
}

class PracticeDataService {
  private data: PinnacleData | null = null;
  private url = '/Pinnacle_Railway_f7a7588e.json';

  async loadData(): Promise<PinnacleData> {
    if (this.data) return this.data;
    const response = await fetch(this.url);
    if (!response.ok) throw new Error('Failed to load practice data');
    this.data = await response.json();
    return this.data!;
  }

  async getSubjects(): Promise<string[]> {
    const data = await this.loadData();
    return Object.keys(data.content);
  }

  async getQuestionsBySubject(subject: string): Promise<PinnacleQuestion[]> {
    const data = await this.loadData();
    const subjectContent = data.content[subject];
    if (!subjectContent) return [];

    const allQuestions: PinnacleQuestion[] = [];
    Object.values(subjectContent).forEach(topicContent => {
      Object.values(topicContent).forEach(pageQuestions => {
        allQuestions.push(...pageQuestions);
      });
    });
    return allQuestions;
  }

  // Get unique topics for a subject to use as "tags"
  async getTopicsForSubject(subject: string): Promise<string[]> {
    const data = await this.loadData();
    const subjectContent = data.content[subject];
    return subjectContent ? Object.keys(subjectContent) : [];
  }
}

export const practiceDataService = new PracticeDataService();
