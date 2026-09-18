import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RoadmapBoard } from '@/components/roadmap/RoadmapBoard';
import type { RoadmapData } from '@/types/post.types';

const roadmap: RoadmapData = {
  planned: [
    {
      _id: 'planned-1',
      title: 'Planned request',
      categories: ['general'],
      voteCount: 4,
      commentCount: 2,
    },
  ],
  'in-progress': [],
  completed: [
    {
      _id: 'completed-1',
      title: 'Completed request',
      categories: ['performance'],
      voteCount: 8,
      commentCount: 1,
    },
  ],
};

describe('RoadmapBoard', () => {
  it('renders the three approved public columns and cards', () => {
    render(<RoadmapBoard roadmap={roadmap} />);

    expect(screen.getByText('Planned')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('Planned request')).toBeTruthy();
    expect(screen.getByText('Completed request')).toBeTruthy();
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
  });
});
