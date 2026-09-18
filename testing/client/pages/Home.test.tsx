import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/pages/Home';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/context/AuthContext';
import { FeatureSubmissionProvider } from '@/context/FeatureSubmissionContext';

vi.mock('@/hooks/usePosts', () => ({ usePosts: vi.fn() }));
vi.mock('@/context/AuthContext', () => ({ useAuth: vi.fn() }));

const mockedUsePosts = vi.mocked(usePosts);
const mockedUseAuth = vi.mocked(useAuth);

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <FeatureSubmissionProvider>
          <Home />
        </FeatureSubmissionProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Home feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<typeof useAuth>);
  });

  it('shows loading skeletons', () => {
    mockedUsePosts.mockReturnValue({ isLoading: true, isFetching: true, isError: false } as any);
    renderHome();
    expect(screen.getByLabelText('Loading feature requests')).toBeTruthy();
  });

  it('shows the empty feed state', () => {
    mockedUsePosts.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: { posts: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    } as any);
    renderHome();
    expect(screen.getByText('No feature requests yet')).toBeTruthy();
  });

  it('shows an error and retries the feed', () => {
    const refetch = vi.fn();
    mockedUsePosts.mockReturnValue({ isLoading: false, isFetching: false, isError: true, refetch } as any);
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });
});
