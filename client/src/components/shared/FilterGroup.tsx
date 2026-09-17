import { Checkbox } from '../ui/checkbox';
import { POST_CATEGORIES, POST_STATUS_LABELS, type PostStatus } from '../../types/post.types';

const categoryLabels: Record<string, string> = {
  'ui-ux': 'UI/UX',
  integrations: 'Integrations',
  performance: 'Performance',
  general: 'General',
};

export function FilterGroup({
  categories,
  statuses,
  onCategoryChange,
  onStatusChange,
}: {
  categories: string[];
  statuses: PostStatus[];
  onCategoryChange: (category: string, checked: boolean) => void;
  onStatusChange: (status: PostStatus, checked: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Category</legend>
        {POST_CATEGORIES.map((category) => (
          <label key={category} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={categories.includes(category)}
              onCheckedChange={(checked) => onCategoryChange(category, Boolean(checked))}
              aria-label={categoryLabels[category]}
            />
            <span>{categoryLabels[category]}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Status</legend>
        {(Object.keys(POST_STATUS_LABELS) as PostStatus[]).map((status) => (
          <label key={status} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={statuses.includes(status)}
              onCheckedChange={(checked) => onStatusChange(status, Boolean(checked))}
              aria-label={POST_STATUS_LABELS[status]}
            />
            <span>{POST_STATUS_LABELS[status]}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
