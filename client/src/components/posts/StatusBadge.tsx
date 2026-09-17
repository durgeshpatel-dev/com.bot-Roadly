import { Badge } from '../ui/badge';
import type { PostStatus } from '../../types/post.types';
import { POST_STATUS_LABELS } from '../../types/post.types';

const statusVariants: Record<PostStatus, 'default' | 'info' | 'warning' | 'success'> = {
  'under-review': 'warning',
  planned: 'info',
  'in-progress': 'default',
  completed: 'success',
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return <Badge variant={statusVariants[status]}>{POST_STATUS_LABELS[status]}</Badge>;
}
