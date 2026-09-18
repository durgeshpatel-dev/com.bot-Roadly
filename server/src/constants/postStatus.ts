export const POST_STATUSES = [
  'under-review',
  'planned',
  'in-progress',
  'completed',
  'rejected'
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_TRANSITIONS: Record<PostStatus, readonly PostStatus[]> = {
  'under-review': ['planned', 'in-progress', 'completed', 'rejected'],
  planned: ['under-review', 'in-progress', 'completed', 'rejected'],
  'in-progress': ['under-review', 'planned', 'completed', 'rejected'],
  completed: ['under-review', 'planned', 'in-progress', 'rejected'],
  rejected: ['under-review', 'planned', 'in-progress', 'completed'],
};

export const isPostStatusTransitionAllowed = (
  currentStatus: PostStatus,
  nextStatus: PostStatus
) => POST_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
