import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, ClipboardList, MessageCircle, ThumbsUp, ChevronRight } from 'lucide-react';
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
    <Card className="glass-panel overflow-hidden border-transparent shadow-md premium-card-hover bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">{label}</CardDescription>
        <span className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg [&_svg]:size-5">{icon}</span>
      </CardHeader>
      <CardContent><p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{value.toLocaleString()}</p></CardContent>
    </Card>
  );
}

function TopRequests({ title, posts, metric }: { title: string; posts: AdminStatsPost[]; metric: 'voteCount' | 'commentCount' }) {
  return (
    <Card className="glass-panel min-w-0 shadow-md bg-card/60 backdrop-blur-md border-transparent">
      <CardHeader>
        <CardTitle render={<h2 />} className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</CardTitle>
        <CardDescription className="text-slate-500">Highest engagement across all requests.</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <ol className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {posts.map((post) => (
              <li key={post._id} className="group">
                <Link to={`/posts/${post._id}`} className="flex items-center justify-between gap-4 py-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg -mx-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{post.title}</p>
                    <Badge variant="outline" size="sm" className="bg-background/50 shadow-sm border-border/50 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">{POST_STATUS_LABELS[post.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {post[metric].toLocaleString()} {metric === 'voteCount' ? 'votes' : 'comments'}
                    </span>
                    <ChevronRight className="size-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
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
              <CardTitle render={<h2 />}>Status overview</CardTitle>
              <CardDescription>Current lifecycle distribution of all requests.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {(['under-review', 'planned', 'in-progress', 'completed', 'rejected'] as const).map((status) => (
                <Link to={`/admin/posts?status=${status}`} className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-white/10 px-4 py-3 bg-card/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50" key={status}>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><CheckCircle2 className="size-4 text-indigo-500" />{POST_STATUS_LABELS[status]}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{statsQuery.data.statusCounts[status]?.toLocaleString() || 0}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
