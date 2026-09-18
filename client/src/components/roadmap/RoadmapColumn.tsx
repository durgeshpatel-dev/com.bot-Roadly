import { Empty, EmptyDescription, EmptyTitle } from '../ui/empty';
import { RoadmapCard } from './RoadmapCard';
import type { RoadmapPost } from '../../types/post.types';

interface RoadmapColumnProps {
  title: string;
  posts: RoadmapPost[];
}

export function RoadmapColumn({ title, posts }: RoadmapColumnProps) {
  return (
    <section className="rounded-2xl border border-slate-200/50 bg-slate-100/40 dark:border-white/5 dark:bg-slate-900/40 min-w-0 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 px-4 py-3 bg-card/40 backdrop-blur-md rounded-t-2xl">
        <h2 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">{posts.length}</span>
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
