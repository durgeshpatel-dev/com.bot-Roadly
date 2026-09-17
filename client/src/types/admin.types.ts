import type { PostStatus } from './post.types';

export interface AdminStatsPost {
  _id: string;
  title: string;
  status: PostStatus;
  voteCount: number;
  commentCount: number;
}

export interface AdminStats {
  totalPosts: number;
  totalVotes: number;
  totalComments: number;
  statusCounts: Record<PostStatus, number>;
  topVoted: AdminStatsPost[];
  topDiscussed: AdminStatsPost[];
}
