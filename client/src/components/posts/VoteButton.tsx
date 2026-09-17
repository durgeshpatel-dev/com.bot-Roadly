import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useVote } from '@/hooks/useVote';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AuthPromptDialog } from '../auth/AuthPromptDialog';

interface VoteButtonProps {
  postId: string;
  voteCount: number;
  hasVoted: boolean;
  className?: string;
}

export const VoteButton = ({ postId, voteCount, hasVoted, className }: VoteButtonProps) => {
  const { isAuthenticated } = useAuth();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const { upvote, unvote, isUpvoting, isUnvoting } = useVote();

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }

    if (hasVoted) {
      unvote(postId);
    } else {
      upvote(postId);
    }
  };

  const isLoading = isUpvoting || isUnvoting;

  return (
    <>
      <Button
        variant={hasVoted ? 'default' : 'outline'}
        size="sm"
        className={cn(
          'h-auto min-w-16 flex-col gap-1 rounded-lg px-3 py-3 transition-colors',
          hasVoted
            ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground',
          className
        )}
        onClick={handleVote}
        disabled={isLoading}
        aria-pressed={hasVoted}
        aria-label={hasVoted ? 'Remove vote' : 'Upvote'}
      >
        <ChevronUp className="size-5" strokeWidth={3} />
        <span className="text-sm font-bold">{voteCount}</span>
      </Button>
      <AuthPromptDialog open={authPromptOpen} onOpenChange={setAuthPromptOpen} />
    </>
  );
};
