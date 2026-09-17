import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Empty, EmptyDescription, EmptyTitle } from '../components/ui/empty';
import { Skeleton } from '../components/ui/skeleton';
import { RoadmapBoard } from '../components/roadmap/RoadmapBoard';
import { useRoadmap } from '../hooks/useRoadmap';
import { PageHeader } from '../components/layout/PageHeader';

export default function RoadmapPage() {
  const roadmapQuery = useRoadmap();

  const isEmpty = roadmapQuery.data &&
    roadmapQuery.data.planned.length === 0 &&
    roadmapQuery.data['in-progress'].length === 0 &&
    roadmapQuery.data.completed.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Product roadmap"
        title="Public roadmap"
        description="See which feature requests are planned, in progress, and completed."
      />

      {roadmapQuery.isLoading && (
        <div className="grid gap-6 lg:grid-cols-3" aria-label="Loading roadmap">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {roadmapQuery.isError && (
        <Alert className="flex items-center justify-between gap-4">
          <span>Unable to load the roadmap.</span>
          <Button variant="outline" size="sm" onClick={() => roadmapQuery.refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      {!roadmapQuery.isLoading && !roadmapQuery.isError && isEmpty && (
        <Empty>
          <EmptyTitle>The roadmap is empty</EmptyTitle>
          <EmptyDescription>Approved feature requests will appear here as they move beyond review.</EmptyDescription>
        </Empty>
      )}

      {!roadmapQuery.isLoading && !roadmapQuery.isError && roadmapQuery.data && !isEmpty && (
        <RoadmapBoard roadmap={roadmapQuery.data} />
      )}
    </div>
  );
}
