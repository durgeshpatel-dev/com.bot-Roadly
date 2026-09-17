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
  onSubmit: (content: string) => unknown | Promise<unknown>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValue?: string;
  placeholder?: string;
}) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = isLoading || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || pending) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      if (!initialValue) setContent('');
    } catch {
      // The mutation displays the error toast; retain the draft so it can be retried.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        aria-label={initialValue ? 'Edit comment' : placeholder}
        maxLength={2000}
        disabled={pending}
        className="min-h-[100px] resize-y w-full"
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending || !content.trim()}>
          {pending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
