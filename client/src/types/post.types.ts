export type PostStatus = 'under-review' | 'planned' | 'in-progress' | 'completed';
export type PostSort = 'newest' | 'most-voted' | 'most-discussed';
export type PostCategory = 'ui-ux' | 'integrations' | 'performance' | 'general';

export const POST_CATEGORIES: PostCategory[] = ['ui-ux', 'integrations', 'performance', 'general'];

export interface PostAuthor {
  _id: string;
  name: string;
}

export interface PostSummary {
  _id: string;
  title: string;
  description: string;
  author: PostAuthor;
  categories: string[];
  status: PostStatus;
  voteCount: number;
  commentCount: number;
  hasVoted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type AdminPost = PostSummary & { updatedAt: string };

export interface PostListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface AdminPostFilters {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'most-voted' | 'most-discussed';
  category?: string;
  status?: string;
  search?: string;
}

export interface PostQueryState {
  page: number;
  limit: number;
  sort: PostSort;
  category: string[];
  status: PostStatus[];
  search: string;
}

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  'under-review': 'Under Review',
  planned: 'Planned',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export const POST_STATUS_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  'under-review': ['planned'],
  planned: ['under-review', 'in-progress'],
  'in-progress': ['planned', 'completed'],
  completed: ['in-progress'],
};

export interface RoadmapPost {
  _id: string;
  title: string;
  categories: string[];
  voteCount: number;
  commentCount: number;
}

export interface RoadmapData {
  planned: RoadmapPost[];
  'in-progress': RoadmapPost[];
  completed: RoadmapPost[];
}
