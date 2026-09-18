import { ArrowLeft, CalendarDays, MessageCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { usePost } from '../hooks/usePost';
import { CommentList } from '../components/comments/CommentList';
import { CategoryTag } from '../components/posts/CategoryTag';
import { MarkdownPreview } from '../components/posts/MarkdownPreview';
import { StatusBadge } from '../components/posts/StatusBadge';
import { VoteButton } from '../components/posts/VoteButton';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { ActivityTimeline } from '../components/activity/ActivityTimeline';

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading feature request">
      <Skeleton className="h-5 w-28" />
      <Card>
        <CardHeader className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-4/5" />
        </CardContent>
      </Card>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postQuery = usePost(id);

  if (postQuery.isLoading) return <DetailSkeleton />;

  if (postQuery.isError || !postQuery.data) {
    const isNotFound = (postQuery.error as { response?: { status?: number } } | null)?.response?.status === 404;
    return (
      <div className="space-y-6">
        <Button variant="ghost" render={<Link to="/" />}><ArrowLeft aria-hidden="true" />Back to requests</Button>
        <Alert variant="error" className="flex items-center justify-between gap-4">
          <span>{isNotFound ? 'This feature request was not found.' : 'Unable to load this feature request.'}</span>
          {!isNotFound && <Button variant="outline" size="sm" onClick={() => postQuery.refetch()}>Retry</Button>}
        </Alert>
      </div>
    );
  }

  const post = postQuery.data;
  const authorName = post.author?.name || 'Roadly user';

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" render={<Link to="/" />}><ArrowLeft aria-hidden="true" />Back to requests</Button>

      <Card className="glass-panel overflow-hidden border-transparent shadow-xl dark:border-white/5">
        <CardHeader className="space-y-5 bg-card/60 backdrop-blur-sm border-b border-border/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={post.status} />
            {post.categories.map((category) => <CategoryTag key={category} category={category} />)}
          </div>
          <div className="flex items-start gap-5">
            <div className="shrink-0 pt-1">
              <VoteButton postId={post._id} voteCount={post.voteCount} hasVoted={Boolean(post.hasVoted)} />
            </div>
            <div className="space-y-4">
              <h1 className="wrap-anywhere text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-50">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Avatar className="size-8 border border-border shadow-sm">
                  <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>Submitted by <strong className="text-slate-700 dark:text-slate-300 font-medium">{authorName}</strong></span>
                <span className="flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" />{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 bg-card/40 p-6 sm:p-8">
          <h2 className="sr-only">Feature description</h2>
          <div className="prose dark:prose-invert max-w-none prose-slate">
            <MarkdownPreview description={post.description} full />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-6 mt-8">
            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-sm">
              <MessageCircle className="size-4" aria-hidden="true" />
              {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </CardContent>
      </Card>

      <ActivityTimeline postId={post._id} />

      <section aria-labelledby="discussion-heading">
        <h2 id="discussion-heading" className="sr-only">Feature discussion</h2>
        <CommentList key={post._id} postId={post._id} commentCount={post.commentCount} />
      </section>
    </article>
  );
}
