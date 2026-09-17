import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../api/postApi';
import { POST_CATEGORIES } from '../../types/post.types';
import { toastManager } from '../ui/toast';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const categoryLabels: Record<string, string> = {
  'ui-ux': 'UI/UX',
  integrations: 'Integrations',
  performance: 'Performance',
  general: 'General',
};

export function PostForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    setTitle('');
    setDescription('');
    setCategories([]);
    setError(null);
    onOpenChange(false);
  };

  const toggleCategory = (category: string, checked: boolean) => {
    setCategories((current) => checked
      ? [...current, category]
      : current.filter((value) => value !== category));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }
    if (trimmedDescription.length < 20) {
      setError('Description must be at least 20 characters.');
      return;
    }
    if (categories.length === 0) {
      setError('Select at least one category.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await createPost({ title: trimmedTitle, description: trimmedDescription, categories });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      toastManager.add({ type: 'success', title: 'Feature request submitted' });
      close();
    } catch (submissionError: any) {
      setError(submissionError.response?.data?.error?.message || 'Unable to submit feature request.');
      toastManager.add({ type: 'error', title: 'Feature request failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a feature request</DialogTitle>
          <DialogDescription>Describe the problem or idea you would like Roadly to consider.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="feature-title">Title</Label>
            <Input id="feature-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} placeholder="What should Roadly improve?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feature-description">Description</Label>
            <Textarea id="feature-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} placeholder="Explain the problem and the outcome you want. Markdown is supported." className="min-h-32 resize-y" />
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Categories</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {POST_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={categories.includes(category)} onCheckedChange={(checked) => toggleCategory(category, Boolean(checked))} />
                  <span>{categoryLabels[category]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit request'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
