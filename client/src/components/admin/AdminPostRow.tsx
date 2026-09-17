import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  POST_STATUS_LABELS,
  POST_STATUS_TRANSITIONS,
} from '../../types/post.types';
import type { AdminPost, PostStatus } from '../../types/post.types';

interface AdminPostRowProps {
  post: AdminPost;
  isUpdating: boolean;
  onStatusChange: (postId: string, status: PostStatus) => void;
}

const statusVariant = (status: PostStatus) =>
  status === 'under-review' ? 'outline' : 'default';

export function AdminPostRow({ post, isUpdating, onStatusChange }: AdminPostRowProps) {
  const statusOptions = [post.status, ...POST_STATUS_TRANSITIONS[post.status]];

  return (
    <tr className="border-b last:border-0">
      <td className="p-3 align-top">
        <div className="font-medium">{post.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">by {post.author.name}</div>
      </td>
      <td className="p-3 align-top">
        <div className="flex flex-wrap gap-1">
          {post.categories.map((category) => (
            <Badge key={category} variant="outline">{category}</Badge>
          ))}
        </div>
      </td>
      <td className="p-3 align-top">
        <Badge variant={statusVariant(post.status)}>
          {POST_STATUS_LABELS[post.status]}
        </Badge>
      </td>
      <td className="p-3 align-top text-sm">{post.voteCount}</td>
      <td className="p-3 align-top text-sm">{post.commentCount}</td>
      <td className="p-3 align-top">
        <Select
          value={post.status}
          onValueChange={(value) => {
            if (value && value !== post.status) {
              onStatusChange(post._id, value as PostStatus);
            }
          }}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-40" aria-label={`Change status for ${post.title}`}>
            <SelectValue>{POST_STATUS_LABELS[post.status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {POST_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
    </tr>
  );
}
