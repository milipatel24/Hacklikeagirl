export interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  votes: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  questions: number;
  answers: number;
  reputation: number;
  badges: number;
}

export interface RecentActivity {
  id: string;
  type: 'question' | 'answer';
  title: string;
  votes: number;
  answers?: number;
  createdAt: Date;
  tags: string[];
}

// Mock questions data
export const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement authentication in React with JWT?',
    content: 'I\'m building a React application and need to implement user authentication using JWT tokens. What\'s the best approach for handling token storage, refresh tokens, and protecting routes?',
    author: {
      id: '1',
      username: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    tags: ['react', 'authentication', 'jwt', 'javascript'],
    votes: 15,
    answers: 5,
    views: 234,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Best practices for TypeScript configuration in 2024',
    content: 'What are the current best practices for configuring TypeScript in a modern web application? I\'m particularly interested in strict mode settings and module resolution.',
    author: {
      id: '2',
      username: 'typescript_dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=typescript'
    },
    tags: ['typescript', 'configuration', 'best-practices'],
    votes: 23,
    answers: 8,
    views: 456,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    title: 'State management with Redux Toolkit vs Zustand',
    content: 'I\'m starting a new React project and can\'t decide between Redux Toolkit and Zustand for state management. What are the pros and cons of each?',
    author: {
      id: '3',
      username: 'state_master',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=state'
    },
    tags: ['react', 'redux', 'zustand', 'state-management'],
    votes: 31,
    answers: 12,
    views: 789,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22')
  }
];

// Mock answers data
export const mockAnswers: Answer[] = [
  {
    id: '1',
    content: 'For JWT authentication in React, I recommend using a combination of localStorage for token storage and an HTTP-only cookie for refresh tokens. Here\'s a complete implementation...',
    author: {
      id: '4',
      username: 'auth_expert',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=auth'
    },
    votes: 25,
    isAccepted: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '2',
    content: 'TypeScript strict mode is highly recommended. Here are the essential compiler options for 2024...',
    author: {
      id: '5',
      username: 'ts_guru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guru'
    },
    votes: 18,
    isAccepted: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

// Mock user statistics
export const getUserStats = (userId: string): UserStats => {
  const stats: Record<string, UserStats> = {
    '1': { questions: 12, answers: 45, reputation: 1250, badges: 8 },
    '2': { questions: 8, answers: 32, reputation: 890, badges: 5 },
    '3': { questions: 15, answers: 67, reputation: 2100, badges: 12 }
  };
  
  return stats[userId] || { questions: 0, answers: 0, reputation: 0, badges: 0 };
};

// Mock recent activity
export const getUserRecentActivity = (userId: string): RecentActivity[] => {
  const activities: Record<string, RecentActivity[]> = {
    '1': [
      {
        id: '1',
        type: 'question',
        title: 'How to implement authentication in React with JWT?',
        votes: 15,
        answers: 5,
        createdAt: new Date('2024-01-15'),
        tags: ['react', 'authentication', 'jwt']
      },
      {
        id: '2',
        type: 'answer',
        title: 'Best practices for TypeScript configuration in 2024',
        votes: 12,
        createdAt: new Date('2024-01-10'),
        tags: ['typescript', 'configuration']
      },
      {
        id: '3',
        type: 'question',
        title: 'State management with Redux Toolkit vs Zustand',
        votes: 31,
        answers: 12,
        createdAt: new Date('2024-01-05'),
        tags: ['react', 'redux', 'zustand']
      }
    ]
  };
  
  return activities[userId] || [];
};

// Mock notifications
export const getMockNotifications = () => [
  {
    id: '1',
    type: 'answer' as const,
    message: 'you answered someones question about React Authentication',
    questionId: '1',
    answerId: '1',
    timestamp: new Date('2024-01-20T10:30:00'),
    read: false
  },
  {
    id: '2',
    type: 'comment' as const,
    message: 'New comment on your TypeScript configuration answer',
    questionId: '2',
    answerId: '2',
    timestamp: new Date('2024-01-19T15:45:00'),
    read: true
  },
  {
    id: '3',
    type: 'mention' as const,
    message: 'You were mentioned in a question about state management',
    questionId: '3',
    timestamp: new Date('2024-01-18T09:15:00'),
    read: false
  }
]; 