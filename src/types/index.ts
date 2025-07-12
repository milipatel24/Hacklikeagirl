
export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  answers: Answer[];
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  isAccepted: boolean;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string; // question or answer id
  type: 'question' | 'answer';
  direction: 'up' | 'down';
}
