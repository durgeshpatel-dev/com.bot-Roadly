import { useState } from 'react';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Empty, EmptyDescription, EmptyTitle } from '../../components/ui/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAdminPosts, useUpdatePostStatus } from '../../hooks/useAdmin';
import { AdminPostRow } from '../../components/admin/AdminPostRow';
import { PageHeader } from '../../components/layout/PageHeader';
import type { AdminPostFilters } from '../../types/post.types';

export default function AdminPostsPage() {
  const [filters, setFilters] = useState<AdminPostFilters>({ page: 1, limit: 50 });
  const postsQuery = useAdminPosts(filters);
  const statusMutation = useUpdatePostStatus();

  const setStatusFilter = (value: string | null) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      status: value && value !== 'all' ? value : undefined,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Feature requests"
        description="Manage lifecycle status for all submissions."
        actions={(
          <Select value={filters.status || 'all'} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Filter requests by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      {postsQuery.isLoading && (
        <div className="space-y-3" aria-label="Loading requests">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      )}

      {postsQuery.isError && (
        <Alert className="flex items-center justify-between gap-4">
          <span>Unable to load feature requests.</span>
          <Button variant="outline" size="sm" onClick={() => postsQuery.refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      {!postsQuery.isLoading && !postsQuery.isError && postsQuery.data?.posts.length === 0 && (
        <Empty>
          <EmptyTitle>No feature requests found</EmptyTitle>
          <EmptyDescription>Try another status filter or check back after new submissions.</EmptyDescription>
        </Empty>
      )}

      {!postsQuery.isLoading && !postsQuery.isError && (postsQuery.data?.posts.length || 0) > 0 && (
        <div className="space-y-4">
          <div className="surface overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Transition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postsQuery.data?.posts.map((post) => (
                  <AdminPostRow
                    key={post._id}
                    post={post}
                    isUpdating={statusMutation.isPending && statusMutation.variables?.postId === post._id}
                    onStatusChange={(postId, status) => statusMutation.mutate({ postId, status })}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!postsQuery.data?.meta.hasPrevPage || postsQuery.isFetching}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {postsQuery.data?.meta.page} of {postsQuery.data?.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!postsQuery.data?.meta.hasNextPage || postsQuery.isFetching}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
