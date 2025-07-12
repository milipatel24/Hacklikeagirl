
import React from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Question } from '@/types';
import { useNavigate } from 'react-router-dom';

interface QuestionCardProps {
  question: Question;
  onVote?: (questionId: string, direction: 'up' | 'down') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onVote }) => {
  const navigate = useNavigate();

  const handleVote = (direction: 'up' | 'down') => {
    if (onVote) {
      onVote(question.id, direction);
    }
  };

  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          {/* Vote section */}
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('up')}
              className="p-1 h-8 w-8 hover:bg-green-100 hover:text-green-600"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-lg">{question.votes}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              className="p-1 h-8 w-8 hover:bg-red-100 hover:text-red-600"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Question content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3
                className="text-lg font-semibold text-[#b07d62] hover:text-[#8c624e] cursor-pointer"
                onClick={() => navigate(`/questions/${question.id}`)}
              >
                {question.title}
              </h3>
              {hasAcceptedAnswer && (
                <div className="flex items-center gap-1 text-green-600 ml-2">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Solved</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{question.answers.length} answers</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span>asked by</span>
                <div className="flex items-center gap-1">
                  {question.author.avatar && (
                    <img
                      src={question.author.avatar}
                      alt={question.author.username}
                      className="w-5 h-5 rounded-full"
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
  );
};
