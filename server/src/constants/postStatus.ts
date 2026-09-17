export const POST_STATUSES = [
  'under-review',
  'planned',
  'in-progress',
  'completed',
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_TRANSITIONS: Record<PostStatus, readonly PostStatus[]> = {
  'under-review': ['planned'],
  planned: ['under-review', 'in-progress'],
  'in-progress': ['planned', 'completed'],
  completed: ['in-progress'],
};

export const isPostStatusTransitionAllowed = (
  currentStatus: PostStatus,
  nextStatus: PostStatus
) => POST_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
