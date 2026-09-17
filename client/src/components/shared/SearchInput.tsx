import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useDebounce } from '../../hooks/useDebounce';

export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const debouncedDraft = useDebounce(draft, 300);

  useEffect(() => {
    const normalized = debouncedDraft.trim();
    onChange(normalized.length >= 2 ? normalized : '');
  }, [debouncedDraft, onChange]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search feature requests..."
        aria-label="Search feature requests"
        className="pl-9 pr-10"
      />
      {draft && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setDraft('')}
          aria-label="Clear search"
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
