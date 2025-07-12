
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RichTextEditor } from '@/components/RichTextEditor';
import { AnswerCard } from '@/components/AnswerCard';
import { Question, Answer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Mock API call to fetch question
    const mockQuestion: Question = {
      id: id || '1',
      title: 'How to implement JWT authentication in React?',
      description: 'I\'m trying to implement JWT authentication in my React application but I\'m having trouble with token storage and refresh logic.\n\nI\'ve tried using localStorage but I\'m concerned about security. What are the best practices?',
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
          questionId: id || '1',
          content: 'You can use **localStorage** to store JWT tokens, but make sure to implement proper refresh logic.\n\nHere\'s a basic example:\n\n```javascript\nconst token = localStorage.getItem(\'token\');\n```\n\nHowever, consider using **httpOnly cookies** for better security.',
          author: {
            id: '3',
            username: 'janesmith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janesmith'
          },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          votes: 8,
          isAccepted: true
        },
        {
          id: 'a2',
          questionId: id || '1',
          content: 'Another approach is to use a state management library like **Redux** or **Zustand** to handle authentication state.\n\nThis gives you better control over the authentication flow.',
          author: {
            id: '4',
            username: 'devexpert',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devexpert'
          },
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16'),
          votes: 5,
          isAccepted: false
        }
      ],
      acceptedAnswerId: 'a1'
    };
    
    setQuestion(mockQuestion);
  }, [id]);

  const handleQuestionVote = (direction: 'up' | 'down') => {
    if (!user || !question) return;
    
    setQuestion(prev => prev ? {
      ...prev,
      votes: direction === 'up' ? prev.votes + 1 : prev.votes - 1
    } : null);
  };

  const handleAnswerVote = (answerId: string, direction: 'up' | 'down') => {
    if (!user || !question) return;
    
    setQuestion(prev => prev ? {
      ...prev,
      answers: prev.answers.map(answer => 
        answer.id === answerId 
          ? { ...answer, votes: direction === 'up' ? answer.votes + 1 : answer.votes - 1 }
          : answer
      )
    } : null);
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!user || !question || question.author.id !== user.id) return;
    
    setQuestion(prev => prev ? {
      ...prev,
      answers: prev.answers.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      })),
      acceptedAnswerId: answerId
    } : null);

    // Add notification to answer author
    const answer = question.answers.find(a => a.id === answerId);
    if (answer) {
      addNotification({
        type: 'answer',
        message: `Your answer was accepted for "${question.title}"`,
        questionId: question.id,
        answerId: answerId
      });
    }

    toast({
      title: "Answer Accepted",
      description: "The answer has been marked as accepted.",
    });
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!answerContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please write your answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAnswer: Answer = {
        id: Date.now().toString(),
        questionId: question?.id || '',
        content: answerContent,
        author: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        votes: 0,
        isAccepted: false
      };

      setQuestion(prev => prev ? {
        ...prev,
        answers: [...prev.answers, newAnswer]
      } : null);

      // Add notification to question author
      if (question && question.author.id !== user.id) {
        addNotification({
          type: 'answer',
          message: `${user.username} answered your question "${question.title}"`,
          questionId: question.id,
          answerId: newAnswer.id
        });
      }

      setAnswerContent('');
      toast({
        title: "Answer Posted!",
        description: "Your answer has been successfully posted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#b07d62] hover:underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />')
      .replace(/\n/g, '<br />');
  };

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const isQuestionOwner = user?.id === question.author.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Question */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex gap-4">
            {/* Vote section */}
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuestionVote('up')}
                  className="p-1 h-8 w-8 hover:bg-green-100 hover:text-green-600"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              )}
              <span className="font-semibold text-xl">{question.votes}</span>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuestionVote('down')}
                  className="p-1 h-8 w-8 hover:bg-red-100 hover:text-red-600"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <MessageSquare className="h-4 w-4" />
                <span>{question.answers.length}</span>
              </div>
            </div>

            {/* Question content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
              
              <div
                className="prose max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: renderContent(question.description) }}
              />

              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div></div>
                <div className="flex items-center gap-2">
                  <span>asked</span>
                  <div className="flex items-center gap-1">
                    {question.author.avatar && (
                      <img
                        src={question.author.avatar}
                        alt={question.author.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{question.author.username}</span>
                  </div>
                  <span>{question.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-6">
          {question.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              isQuestionOwner={isQuestionOwner}
              onVote={handleAnswerVote}
              onAccept={handleAcceptAnswer}
            />
          ))}
        </div>
      </div>

      {/* Answer Form */}
      {user ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Answer</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? 'Posting...' : 'Post Your Answer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">You must be logged in to post an answer.</p>
            <Button onClick={() => navigate('/login')}>
              Login to Answer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
