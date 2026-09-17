import { useState } from 'react';
import type { IComment } from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import { useComments } from '../../hooks/useComments';
import { CommentForm } from './CommentForm';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export function CommentItem({ comment, postId, depth = 0 }: { comment: IComment; postId: string; depth: number }) {
  const { user } = useAuth();
  const { updateComment, deleteComment, createComment, isUpdating, isCreating } = useComments(postId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // Fallback to '[deleted]' if author is null (just in case) or if we wanted to obscure it,
  // but requirements said to keep author relation.
  const authorName = comment.author?.name || 'Unknown';
  
  const isAuthor = user?._id === comment.author?._id;
  const isAdmin = user?.role === 'admin';
  const canEditOrDelete = (isAuthor || isAdmin) && !comment.isDeleted;
  const canReply = user && !comment.isDeleted && depth === 0;

  return (
    <div className={`group/comment flex min-w-0 gap-3 sm:gap-4 ${depth > 0 ? 'mt-4' : ''}`}>
      <Avatar className="size-9 shrink-0 sm:size-10">
        <AvatarFallback>{comment.isDeleted ? 'D' : authorName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-sm">
              {authorName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && !comment.isDeleted && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>
          
          {canEditOrDelete && (
            <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/comment:opacity-100 sm:group-focus-within/comment:opacity-100">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>Delete</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the comment content from the discussion.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
                    <AlertDialogClose
                      render={<Button variant="destructive" />}
                      onClick={() => deleteComment(comment._id)}
                    >
                      Delete
                    </AlertDialogClose>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {isEditing ? (
          <CommentForm
            initialValue={comment.content}
            isLoading={isUpdating}
            onSubmit={(content) => {
              updateComment({ commentId: comment._id, content });
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="prose max-w-none break-words text-sm dark:prose-invert">
            {comment.isDeleted ? (
              <p className="italic text-muted-foreground">[deleted]</p>
            ) : (
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            )}
          </div>
        )}

        {canReply && !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)} className="mt-2 text-muted-foreground">
            Reply
          </Button>
        )}

        {isReplying && (
          <div className="mt-4">
            <CommentForm
              isLoading={isCreating}
              placeholder="Write a reply..."
              onSubmit={(content) => {
                createComment({ content, parentComment: comment._id });
                setIsReplying(false);
              }}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
