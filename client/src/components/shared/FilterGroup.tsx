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
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100 mb-2 uppercase">Category</legend>
        <div className="flex flex-col gap-1">
          {POST_CATEGORIES.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-3 text-sm p-2 -mx-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
              <Checkbox
                checked={categories.includes(category)}
                onCheckedChange={(checked) => onCategoryChange(category, Boolean(checked))}
                aria-label={categoryLabels[category]}
                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 group-hover:border-indigo-400 transition-colors"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors">{categoryLabels[category]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100 mb-2 uppercase">Status</legend>
        <div className="flex flex-col gap-1">
          {(Object.keys(POST_STATUS_LABELS) as PostStatus[]).map((status) => (
            <label key={status} className="flex cursor-pointer items-center gap-3 text-sm p-2 -mx-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
              <Checkbox
                checked={statuses.includes(status)}
                onCheckedChange={(checked) => onStatusChange(status, Boolean(checked))}
                aria-label={POST_STATUS_LABELS[status]}
                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 group-hover:border-indigo-400 transition-colors"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors">{POST_STATUS_LABELS[status]}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
