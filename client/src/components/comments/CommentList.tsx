import { useComments } from '../../hooks/useComments';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Empty, EmptyDescription, EmptyTitle } from '../ui/empty';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { FeedPagination } from '../shared/FeedPagination';
import { useState } from 'react';

export function CommentList({ postId, commentCount }: { postId: string; commentCount?: number }) {
  const [page, setPage] = useState(1);
  const { comments, meta, isLoading, isError, createComment, isCreating, refetch } = useComments(postId, page);
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (isError) return <Alert variant="error" className="mt-8 flex flex-wrap items-center justify-between gap-3">Failed to load comments<Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button></Alert>;

  const visibleCount = comments.filter((comment) => !comment.isDeleted).length + comments.reduce((count, comment) => count + (comment.replies?.filter((reply) => !reply.isDeleted).length || 0), 0);

  return (
    <Card className="mt-8">
      <CardHeader className="border-b">
        <CardTitle>Comments ({commentCount ?? visibleCount})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAuthenticated ? (
          <CommentForm onSubmit={(content) => createComment({ content })} isLoading={isCreating} placeholder="Write a comment..." />
        ) : (
          <Alert>You must be logged in to leave a comment.</Alert>
        )}
        {meta && <FeedPagination meta={{ ...meta, hasPrevPage: page > 1, hasNextPage: page < meta.totalPages }} page={page} onPageChange={setPage} />}

        {comments.length === 0 ? (
          <Empty>
            <EmptyTitle>No comments yet</EmptyTitle>
            <EmptyDescription>Be the first to share your thoughts.</EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} postId={postId} depth={0} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
