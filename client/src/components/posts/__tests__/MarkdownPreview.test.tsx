import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownPreview } from '../MarkdownPreview';

describe('User Markdown security', () => {
  it('does not execute raw HTML or expose active javascript URLs or tracking images', () => {
    const { container } = render(<MarkdownPreview full description={'# Heading\n<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)\n\n![tracker](https://example.com/track.png)'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')?.getAttribute('href')).not.toMatch(/^javascript:/);
    expect(container.querySelector('h1')).toBeNull();
    expect(container.querySelector('h3')?.textContent).toBe('Heading');
  });
});
