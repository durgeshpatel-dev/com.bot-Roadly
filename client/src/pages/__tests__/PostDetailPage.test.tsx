import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PostDetailPage from '../PostDetailPage';
import { usePost } from '../../hooks/usePost';

vi.mock('../../hooks/usePost', () => ({ usePost: vi.fn() }));
vi.mock('../../components/comments/CommentList', () => ({ CommentList: ({ postId }: { postId: string }) => <div>Discussion for {postId}</div> }));
vi.mock('../../components/posts/VoteButton', () => ({ VoteButton: () => <button type="button">Vote</button> }));

const mockedUsePost = vi.mocked(usePost);

describe('PostDetailPage', () => {
  it('renders feature metadata, Markdown content, voting, and discussions', () => {
    mockedUsePost.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        _id: 'post-1',
        title: 'Dashboard improvements',
        description: '**Make dashboards easier to scan.**',
        author: { _id: 'user-1', name: 'Ava' },
        categories: ['ui-ux'],
        status: 'in-progress',
        voteCount: 8,
        commentCount: 2,
        hasVoted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    } as ReturnType<typeof usePost>);

    render(
      <MemoryRouter initialEntries={['/posts/post-1']}>
        <Routes><Route path="/posts/:id" element={<PostDetailPage />} /></Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard improvements')).toBeTruthy();
    expect(screen.getByText('Make dashboards easier to scan.')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Vote')).toBeTruthy();
    expect(screen.getByText('Discussion for post-1')).toBeTruthy();
  });
});
