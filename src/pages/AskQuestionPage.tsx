
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { TagInput } from '@/components/TagInput';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const AskQuestionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || tags.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and add at least one tag.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call - in real app, this would submit to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Question Posted!",
        description: "Your question has been successfully posted.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ask a Question</CardTitle>
          <p className="text-gray-600">
            Be specific and imagine you're asking a question to another person
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-semibold">
                Title *
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Be specific and imagine you're asking a question to another person
              </p>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How do I implement JWT authentication in React?"
                className="text-base"
              />
            </div>

            <div>
              <Label className="text-base font-semibold">
                Description *
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Include all the information someone would need to answer your question
              </p>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Provide details about your question..."
              />
            </div>

            <div>
              <Label className="text-base font-semibold">
                Tags *
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Add up to 5 tags to describe what your question is about
              </p>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="e.g. react, javascript, authentication"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? 'Posting...' : 'Post Question'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
