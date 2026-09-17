import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterGroup } from '../FilterGroup';

describe('FilterGroup', () => {
  it('emits category and status changes', () => {
    const onCategoryChange = vi.fn();
    const onStatusChange = vi.fn();
    render(
      <FilterGroup
        categories={[]}
        statuses={[]}
        onCategoryChange={onCategoryChange}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /UI\/UX/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Under Review/ }));

    expect(onCategoryChange).toHaveBeenCalledWith('ui-ux', true);
    expect(onStatusChange).toHaveBeenCalledWith('under-review', true);
  });
});
