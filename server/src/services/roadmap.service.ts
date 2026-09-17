import { Post } from '../models/Post';

const ROADMAP_STATUSES = ['planned', 'in-progress', 'completed'] as const;
type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export interface RoadmapPost {
  _id: unknown;
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

export class RoadmapService {
  async getRoadmap(): Promise<RoadmapData> {
    const posts = await Post.find(
      { status: { $in: ROADMAP_STATUSES } },
      { title: 1, categories: 1, voteCount: 1, commentCount: 1, status: 1 }
    )
      .sort({ voteCount: -1, createdAt: -1 })
      .lean();

    const roadmap: RoadmapData = {
      planned: [],
      'in-progress': [],
      completed: [],
    };

    for (const post of posts) {
      const status = post.status as RoadmapStatus;
      roadmap[status].push({
        _id: post._id,
        title: post.title,
        categories: post.categories,
        voteCount: post.voteCount,
        commentCount: post.commentCount,
      });
    }

    return roadmap;
  }
}

export const roadmapService = new RoadmapService();
