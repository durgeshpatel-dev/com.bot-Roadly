import { PostCard } from './PostCard';
import type { PostSummary } from '../../types/post.types';

export function PostList({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="space-y-4" aria-label="Feature requests">
      {posts.map((post) => <PostCard key={post._id} post={post} />)}
    </div>
  );
}
