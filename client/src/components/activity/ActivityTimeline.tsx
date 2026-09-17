import { ArrowRight, MessageCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useActivity } from '../../hooks/useActivity';
import { POST_STATUS_LABELS } from '../../types/post.types';
import type { ActivityItem } from '../../api/activity.api';
import { FeedPagination } from '../shared/FeedPagination';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Empty, EmptyDescription, EmptyTitle } from '../ui/empty';
import { Skeleton } from '../ui/skeleton';

const eventCopy = (activity: ActivityItem) => {
  const actor = activity.actor?.name || 'Roadly team';

  if (activity.type === 'post-created') return `${actor} submitted this request`;
  if (activity.type === 'comment-created') return `${actor} joined the discussion`;

  const from = activity.metadata?.fromStatus;
  const to = activity.metadata?.toStatus;
  if (from && to) {
    return `${actor} moved this request from ${POST_STATUS_LABELS[from]} to ${POST_STATUS_LABELS[to]}`;
  }
  return `${actor} changed the request status`;
};

const eventIcon = (type: ActivityItem['type']) => {
  if (type === 'post-created') return <Plus aria-hidden="true" />;
  if (type === 'comment-created') return <MessageCircle aria-hidden="true" />;
  return <ArrowRight aria-hidden="true" />;
};

const formatActivityDate = (value: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

function ActivitySkeleton() {
  return (
    <Card aria-label="Loading activity">
      <CardHeader><Skeleton className="h-6 w-28" /></CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="flex gap-3" key={index}>
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivityTimeline({ postId }: { postId: string }) {
  const [page, setPage] = useState(1);
  const activityQuery = useActivity(postId, page);

  if (activityQuery.isLoading) return <ActivitySkeleton />;

  if (activityQuery.isError || !activityQuery.data) {
    return (
      <Alert variant="error" className="flex items-center justify-between gap-4">
        <span>Unable to load feature activity.</span>
        <Button variant="outline" size="sm" onClick={() => activityQuery.refetch()}>Retry</Button>
      </Alert>
    );
  }

  const { activities, meta } = activityQuery.data;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle render={<h2 />}>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <Empty className="py-8">
            <EmptyTitle>No activity yet</EmptyTitle>
            <EmptyDescription>Updates and discussion activity will appear here.</EmptyDescription>
          </Empty>
        ) : (
          <ol className="space-y-5" aria-label="Feature activity timeline">
            {activities.map((activity, index) => (
              <li className="relative flex gap-3" key={activity._id}>
                {index < activities.length - 1 && <span className="absolute left-4 top-8 h-[calc(100%+1.25rem)] w-px bg-border" aria-hidden="true" />}
                <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground [&_svg]:size-4">
                  {eventIcon(activity.type)}
                </span>
                <div className="min-w-0 space-y-1 pt-1">
                  <p className="text-sm leading-5">{eventCopy(activity)}</p>
                  <time className="text-xs text-muted-foreground" dateTime={activity.createdAt}>
                    {formatActivityDate(activity.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
        <FeedPagination
          meta={meta}
          page={page}
          disabled={activityQuery.isFetching}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
