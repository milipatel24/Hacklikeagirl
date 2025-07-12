
import React, { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Question } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'unanswered'>('newest');

  // Mock data
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        title: 'How to implement JWT authentication in React?',
        description: 'I\'m trying to implement JWT authentication in my React application but I\'m having trouble with token storage and refresh logic.',
        tags: ['react', 'jwt', 'authentication'],
        author: {
          id: '2',
          username: 'johndoe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        votes: 12,
        answers: [
          {
            id: 'a1',
            questionId: '1',
            content: 'You can use localStorage to store JWT tokens, but make sure to implement proper refresh logic.',
            author: {
              id: '3',
              username: 'janesmith',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janesmith'
            },
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            votes: 8,
            isAccepted: true
          }
        ],
        acceptedAnswerId: 'a1'
      },
      {
        id: '2',
        title: 'Best practices for React component state management',
        description: 'What are the current best practices for managing state in React components? Should I use useState, useReducer, or external libraries?',
        tags: ['react', 'state-management', 'hooks'],
        author: {
          id: '4',
          username: 'devmike',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devmike'
        },
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        votes: 18,
        answers: [],
      },
      {
        id: '3',
        title: 'How to optimize React app performance?',
        description: 'My React application is getting slower as it grows. What are some effective ways to optimize performance?',
        tags: ['react', 'performance', 'optimization'],
        author: {
          id: '5',
          username: 'codemaster',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=codemaster'
        },
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
        votes: 25,
        answers: [
          {
            id: 'a2',
            questionId: '3',
            content: 'Use React.memo, useMemo, and useCallback for optimization. Also consider code splitting.',
            author: {
              id: '6',
              username: 'reactexpert',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reactexpert'
            },
            createdAt: new Date('2024-01-13'),
            updatedAt: new Date('2024-01-13'),
            votes: 15,
            isAccepted: false
          }
        ]
      }
    ];
    setQuestions(mockQuestions);
  }, []);

  const handleVote = (questionId: string, direction: 'up' | 'down') => {
    if (!user) return;
    
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          votes: direction === 'up' ? q.votes + 1 : q.votes - 1
        };
      }
      return q;
    }));
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'unanswered':
        return a.answers.length - b.answers.length;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Questions</h1>
          <p className="text-gray-600">{questions.length} questions</p>
        </div>
      </div>

      <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="votes">Most Votes</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {sortedQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onVote={handleVote}
          />
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No questions yet. Be the first to ask!</p>
          {user && (
            <Button className="mt-4" onClick={() => window.location.href = '/ask'}>
              Ask Question
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
