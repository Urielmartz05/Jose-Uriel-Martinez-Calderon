export interface AuthUser {
  id: string;
  username: string;
  email: string;
  totalXp: number;
}

export interface UserProgressData {
  id: string;
  userId: string;
  categoryId: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  completed: boolean;
  highscore: number;
  bestAccuracy: number;
}
