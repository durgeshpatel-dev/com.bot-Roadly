import { Link } from 'react-router-dom';
import { MessageCircle, Clock3 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { CategoryTag } from './CategoryTag';
import { MarkdownPreview } from './MarkdownPreview';
import { StatusBadge } from './StatusBadge';
import { VoteButton } from './VoteButton';
import type { PostSummary } from '../../types/post.types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function PostCard({ post }: { post: PostSummary }) {
  const authorName = post.author?.name || 'Roadly user';

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="gap-4 pb-3 sm:flex-row sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="mt-0.5">
            <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="wrap-anywhere text-sm font-medium">{authorName}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" aria-hidden="true" />
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={post.status} />
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div>
          <CardTitle render={<h2 />} className="wrap-anywhere text-xl leading-tight">
            <Link to={`/posts/${post._id}`} className="hover:text-primary hover:underline">
              {post.title}
            </Link>
          </CardTitle>
          <div className="mt-3">
            <MarkdownPreview description={post.description} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {post.categories.map((category) => <CategoryTag key={category} category={category} />)}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4 border-t pt-4">
        <VoteButton postId={post._id} voteCount={post.voteCount} hasVoted={Boolean(post.hasVoted)} />
        <Button variant="ghost" size="sm" render={<Link to={`/posts/${post._id}`} />}>
          <MessageCircle aria-hidden="true" />
          {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </Button>
      </CardFooter>
    </Card>
  );
}
