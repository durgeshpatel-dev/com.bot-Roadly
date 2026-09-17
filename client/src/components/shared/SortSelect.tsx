import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { PostSort } from '../../types/post.types';

export function SortSelect({ value, onChange }: { value: PostSort; onChange: (value: PostSort) => void }) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as PostSort)}>
      <SelectTrigger aria-label="Sort feature requests" className="min-w-48">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="most-voted">Most Upvoted / Trending</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="most-discussed">Most Discussed</SelectItem>
      </SelectContent>
    </Select>
  );
}
