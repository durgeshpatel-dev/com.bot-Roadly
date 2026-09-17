import { Empty, EmptyDescription, EmptyTitle } from '../ui/empty';
import { RoadmapCard } from './RoadmapCard';
import type { RoadmapPost } from '../../types/post.types';

interface RoadmapColumnProps {
  title: string;
  posts: RoadmapPost[];
}

export function RoadmapColumn({ title, posts }: RoadmapColumnProps) {
  return (
    <section className="surface-subtle min-w-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <span className="rounded-full bg-background px-2 py-0.5 text-sm text-muted-foreground">{posts.length}</span>
      </div>
      <div className="space-y-3 p-3">
        {posts.length === 0 ? (
          <Empty className="py-10">
            <EmptyTitle className="text-base">Nothing here yet</EmptyTitle>
            <EmptyDescription>No requests in this stage.</EmptyDescription>
          </Empty>
        ) : (
          posts.map((post) => <RoadmapCard key={post._id} post={post} />)
        )}
      </div>
    </section>
  );
}
