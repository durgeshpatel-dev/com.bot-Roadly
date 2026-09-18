import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from '@/components/shared/SearchInput';

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('waits for the debounce interval before emitting a search term', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    onChange.mockClear();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'dashboard' } });
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(299));
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onChange).toHaveBeenCalledWith('dashboard');
  });
});
