import { useCallback, useEffect, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useFeatureSubmission } from '../context/FeatureSubmissionContext';
import { usePosts } from '../hooks/usePosts';
import { PostList } from '../components/posts/PostList';
import { FilterGroup } from '../components/shared/FilterGroup';
import { FeedPagination } from '../components/shared/FeedPagination';
import { SearchInput } from '../components/shared/SearchInput';
import { SortSelect } from '../components/shared/SortSelect';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Empty, EmptyDescription, EmptyTitle } from '../components/ui/empty';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import { PageHeader } from '../components/layout/PageHeader';
import type { PostQueryState, PostStatus } from '../types/post.types';

const DEFAULT_QUERY: PostQueryState = {
  page: 1,
  limit: 10,
  sort: 'newest',
  category: [],
  status: [],
  search: '',
};

const parseList = (value: string | null) => value ? value.split(',').filter(Boolean) : [];

function queryFromParams(params: URLSearchParams): PostQueryState {
  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));
  const sort = params.get('sort');
  const validSort = sort === 'most-voted' || sort === 'most-discussed' || sort === 'newest' ? sort : DEFAULT_QUERY.sort;

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_QUERY.page,
    limit: Number.isFinite(limit) && limit > 0 && limit <= 50 ? limit : DEFAULT_QUERY.limit,
    sort: validSort,
    category: parseList(params.get('category')),
    status: parseList(params.get('status')) as PostStatus[],
    search: params.get('search') || '',
  };
}

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading feature requests">
      {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-64 w-full rounded-2xl" />)}
    </div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openSubmission } = useFeatureSubmission();
  const [query, setQuery] = useState<PostQueryState>(() => queryFromParams(searchParams));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const postsQuery = usePosts(query);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (query.page !== DEFAULT_QUERY.page) nextParams.set('page', String(query.page));
    if (query.limit !== DEFAULT_QUERY.limit) nextParams.set('limit', String(query.limit));
    if (query.sort !== DEFAULT_QUERY.sort) nextParams.set('sort', query.sort);
    if (query.category.length) nextParams.set('category', query.category.join(','));
    if (query.status.length) nextParams.set('status', query.status.join(','));
    if (query.search) nextParams.set('search', query.search);
    setSearchParams(nextParams, { replace: true });
  }, [query, setSearchParams]);

  const handleSearchChange = useCallback((search: string) => {
    setQuery((current) => ({ ...current, page: 1, search }));
  }, []);

  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    setQuery((current) => ({
      ...current,
      page: 1,
      category: checked ? [...current.category, category] : current.category.filter((value) => value !== category),
    }));
  }, []);

  const handleStatusChange = useCallback((status: PostStatus, checked: boolean) => {
    setQuery((current) => ({
      ...current,
      page: 1,
      status: checked ? [...current.status, status] : current.status.filter((value) => value !== status),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery((current) => ({ ...current, page: 1, category: [], status: [], search: '', sort: 'newest' }));
  }, []);

  const hasActiveFilters = Boolean(query.search || query.category.length || query.status.length || query.sort !== 'newest');
  const isEmpty = !postsQuery.isLoading && !postsQuery.isError && postsQuery.data?.posts.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Roadly feedback"
        title="Feature requests"
        description="Browse ideas, vote for what matters, and join the conversation around every feature request."
        actions={<Button onClick={openSubmission}><Plus aria-hidden="true" />Submit a request</Button>}
      />

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="surface sticky top-24 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              {hasActiveFilters && <Button variant="link" size="xs" onClick={clearFilters}>Clear</Button>}
            </div>
            <FilterGroup
              categories={query.category}
              statuses={query.status}
              onCategoryChange={handleCategoryChange}
              onStatusChange={handleStatusChange}
            />
          </div>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="content-toolbar flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput key={query.search} value={query.search} onChange={handleSearchChange} />
            <div className="flex gap-2">
              <SortSelect value={query.sort} onChange={(sort) => setQuery((current) => ({ ...current, page: 1, sort }))} />
              <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                <Filter aria-hidden="true" />
                Filters
              </Button>
            </div>
          </div>

          {postsQuery.isFetching && !postsQuery.isLoading && (
            <p className="text-sm text-muted-foreground" role="status">Updating results...</p>
          )}

          {postsQuery.isLoading && <FeedSkeleton />}

          {postsQuery.isError && (
            <Alert variant="error" className="flex items-center justify-between gap-4">
              <span>Unable to load feature requests.</span>
              <Button variant="outline" size="sm" onClick={() => postsQuery.refetch()}>Retry</Button>
            </Alert>
          )}

          {isEmpty && (
            <Empty className="rounded-2xl border bg-card">
              <EmptyTitle>{hasActiveFilters ? 'No results match your filters' : 'No feature requests yet'}</EmptyTitle>
              <EmptyDescription>{hasActiveFilters ? 'Try another search or clear the active filters.' : 'Be the first to share an idea with the Roadly community.'}</EmptyDescription>
              {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
            </Empty>
          )}

          {!postsQuery.isLoading && !postsQuery.isError && !isEmpty && postsQuery.data && (
            <>
              <PostList posts={postsQuery.data.posts} />
              <FeedPagination
                meta={postsQuery.data.meta}
                page={query.page}
                disabled={postsQuery.isFetching}
                onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
              />
            </>
          )}
        </section>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filter requests</SheetTitle>
            <SheetDescription>Choose one or more categories and statuses.</SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <FilterGroup
              categories={query.category}
              statuses={query.status}
              onCategoryChange={handleCategoryChange}
              onStatusChange={handleStatusChange}
            />
            {hasActiveFilters && <Button variant="outline" className="mt-8 w-full" onClick={clearFilters}>Clear filters</Button>}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
