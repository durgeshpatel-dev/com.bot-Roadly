import { RoadmapColumn } from './RoadmapColumn';
import type { RoadmapData } from '../../types/post.types';

export function RoadmapBoard({ roadmap }: { roadmap: RoadmapData }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <RoadmapColumn title="Planned" posts={roadmap.planned} />
      <RoadmapColumn title="In Progress" posts={roadmap['in-progress']} />
      <RoadmapColumn title="Completed" posts={roadmap.completed} />
    </div>
  );
}
