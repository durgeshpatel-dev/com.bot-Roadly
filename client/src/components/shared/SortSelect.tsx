import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { PostSort } from '../../types/post.types';

const labels: Record<PostSort, string> = { 'most-voted': 'Most Upvoted / Trending', newest: 'Newest', 'most-discussed': 'Most Discussed' };

export function SortSelect({ value, onChange }: { value: PostSort; onChange: (value: PostSort) => void }) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as PostSort)}>
      <SelectTrigger aria-label="Sort feature requests" className="min-w-0 flex-1 sm:min-w-48">
        <SelectValue>{labels[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(labels).map(([sort, label]) => <SelectItem key={sort} value={sort}>{label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
