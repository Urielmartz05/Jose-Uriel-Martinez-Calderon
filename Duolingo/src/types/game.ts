export type CategoryId = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';

export interface Question {
  id: string;
  categoryId: CategoryId;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number; // 0 | 1 | 2 | 3
  explanation: string;
}

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  symbol: string;
  order: number;
}

export interface SessionStats {
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  heartsLeft: number;
  isComplete: boolean;
}
