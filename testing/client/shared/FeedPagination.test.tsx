import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedPagination } from '@/components/shared/FeedPagination';

describe('FeedPagination', () => {
  it('changes pages through the Coss pagination controls', () => {
    const onPageChange = vi.fn();
    render(
      <FeedPagination
        page={1}
        meta={{ page: 1, limit: 10, total: 30, totalPages: 3, hasNextPage: true, hasPrevPage: false }}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Go to page 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
