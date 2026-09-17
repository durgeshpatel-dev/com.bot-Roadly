import ReactMarkdown from 'react-markdown';

export function MarkdownPreview({ description, full = false }: { description: string; full?: boolean }) {
  return (
    <div className={full ? 'prose prose-zinc dark:prose-invert max-w-none' : 'line-clamp-3 text-sm text-muted-foreground'}>
      <ReactMarkdown
        components={{
          a: ({ children }) => <span className="text-primary">{children}</span>,
          img: () => null,
        }}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}
