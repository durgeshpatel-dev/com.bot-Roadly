import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

export function CommentForm({
  onSubmit,
  onCancel,
  isLoading,
  initialValue = '',
  placeholder = 'Write a comment...'
}: {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValue?: string;
  placeholder?: string;
}) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    if (!initialValue) {
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="min-h-[100px] resize-y w-full"
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
