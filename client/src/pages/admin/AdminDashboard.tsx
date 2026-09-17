import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, ClipboardList, MessageCircle, ThumbsUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAdminStats } from '../../hooks/useAdmin';
import { POST_STATUS_LABELS } from '../../types/post.types';
import type { AdminStatsPost } from '../../types/admin.types';

function MetricCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardDescription>{label}</CardDescription>
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      </CardHeader>
      <CardContent><p className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</p></CardContent>
    </Card>
  );
}

function TopRequests({ title, posts, metric }: { title: string; posts: AdminStatsPost[]; metric: 'voteCount' | 'commentCount' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Highest engagement across all requests.</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <ol className="space-y-4">
            {posts.map((post) => (
              <li className="flex items-start justify-between gap-4" key={post._id}>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">{post.title}</p>
                  <Badge variant="outline" size="sm">{POST_STATUS_LABELS[post.status]}</Badge>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {post[metric].toLocaleString()} {metric === 'voteCount' ? 'votes' : 'comments'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const statsQuery = useAdminStats();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Monitor request volume and manage roadmap status."
        actions={<Button render={<Link to="/admin/posts" />}>Manage requests</Button>}
      />

      {statsQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-3" aria-label="Loading dashboard statistics">
          {Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-28 w-full" key={index} />)}
        </div>
      )}

      {statsQuery.isError && (
        <Alert variant="error" className="flex items-center justify-between gap-4">
          <span>Unable to load dashboard statistics.</span>
          <Button variant="outline" size="sm" onClick={() => statsQuery.refetch()}>Retry</Button>
        </Alert>
      )}

      {!statsQuery.isLoading && !statsQuery.isError && statsQuery.data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Total requests" value={statsQuery.data.totalPosts} icon={<ClipboardList />} />
            <MetricCard label="Total votes" value={statsQuery.data.totalVotes} icon={<ThumbsUp />} />
            <MetricCard label="Total comments" value={statsQuery.data.totalComments} icon={<MessageCircle />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status overview</CardTitle>
              <CardDescription>Current lifecycle distribution of all requests.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(['under-review', 'planned', 'in-progress', 'completed'] as const).map((status) => (
                <div className="flex items-center justify-between rounded-lg border px-3 py-2" key={status}>
                  <span className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-muted-foreground" />{POST_STATUS_LABELS[status]}</span>
                  <span className="font-semibold">{statsQuery.data.statusCounts[status].toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopRequests title="Top voted" posts={statsQuery.data.topVoted} metric="voteCount" />
            <TopRequests title="Top discussed" posts={statsQuery.data.topDiscussed} metric="commentCount" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="size-4" aria-hidden="true" />
            <span>Stats are read-only snapshots from current request data.</span>
          </div>
        </div>
      )}
    </div>
  );
}
