
import React from 'react';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Answer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AnswerCardProps {
  answer: Answer;
  isQuestionOwner: boolean;
  onVote?: (answerId: string, direction: 'up' | 'down') => void;
  onAccept?: (answerId: string) => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  isQuestionOwner,
  onVote,
  onAccept
}) => {
  const { user } = useAuth();

  const handleVote = (direction: 'up' | 'down') => {
    if (onVote && user) {
      onVote(answer.id, direction);
    }
  };

  const handleAccept = () => {
    if (onAccept && isQuestionOwner) {
      onAccept(answer.id);
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

  return (
    <Card className={`${answer.isAccepted ? 'border-green-500 bg-green-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote section */}
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className="p-1 h-8 w-8 hover:bg-green-100 hover:text-green-600"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            )}
            <span className="font-semibold text-lg">{answer.votes}</span>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className="p-1 h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            )}
            {isQuestionOwner && !answer.isAccepted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAccept}
                className="p-1 h-8 w-8 hover:bg-green-100 hover:text-green-600 mt-2"
                title="Accept this answer"
              >
                <Check className="h-5 w-5" />
              </Button>
            )}
            {answer.isAccepted && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full mt-2">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Answer content */}
          <div className="flex-1">
            <div
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: renderContent(answer.content) }}
            />

            <div className="flex items-center justify-between text-sm text-gray-600">
              {answer.isAccepted && (
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <Check className="h-4 w-4" />
                  <span>Accepted Answer</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-auto">
                <span>answered by</span>
                <div className="flex items-center gap-1">
                  {answer.author.avatar && (
                    <img
                      src={answer.author.avatar}
                      alt={answer.author.username}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="font-medium">{answer.author.username}</span>
                </div>
                <span>{answer.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
