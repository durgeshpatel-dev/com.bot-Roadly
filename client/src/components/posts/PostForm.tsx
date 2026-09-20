import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../api/postApi';
import { POST_CATEGORIES } from '../../types/post.types';
import { toastManager } from '../ui/toast';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPanel } from '../ui/dialog';
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
      queryClient.invalidateQueries({ queryKey: ['admin'] }).catch(() => {});
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
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl">
        <form onSubmit={submit} className="contents">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900 dark:text-slate-50">Submit a feature request</DialogTitle>
            <DialogDescription className="text-slate-500">Describe the problem or idea you would like Roadly to consider.</DialogDescription>
          </DialogHeader>
          
          <DialogPanel className="space-y-6">
            {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive font-medium shadow-sm" role="alert">{error}</p>}
            
            <div className="space-y-2">
              <Label htmlFor="feature-title" className="text-slate-700 dark:text-slate-300">Title</Label>
              <Input id="feature-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} placeholder="What should Roadly improve?" className="h-11 bg-background/50 focus:bg-background transition-colors" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feature-description" className="text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea id="feature-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} placeholder="Explain the problem and the outcome you want. Markdown is supported." className="min-h-32 resize-y bg-background/50 focus:bg-background transition-colors p-3" />
            </div>
            
            <fieldset className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
              <legend className="text-sm font-semibold text-slate-900 dark:text-slate-50 px-1 -ml-1">Categories</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {POST_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors">
                    <Checkbox checked={categories.includes(category)} onCheckedChange={(checked) => toggleCategory(category, Boolean(checked))} className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{categoryLabels[category]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </DialogPanel>
          
          <DialogFooter className="bg-muted/30">
            <Button type="button" variant="outline" onClick={close} disabled={isSubmitting} className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">{isSubmitting ? 'Submitting...' : 'Submit request'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
