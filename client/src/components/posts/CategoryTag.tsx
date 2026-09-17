import { Badge } from '../ui/badge';

const categoryLabels: Record<string, string> = {
  'ui-ux': 'UI/UX',
  integrations: 'Integrations',
  performance: 'Performance',
  general: 'General',
};

export function CategoryTag({ category }: { category: string }) {
  return <Badge variant="outline">{categoryLabels[category] || category}</Badge>;
}
