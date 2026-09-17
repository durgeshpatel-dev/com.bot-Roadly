import ReactMarkdown from 'react-markdown';

export function MarkdownPreview({ description, full = false }: { description: string; full?: boolean }) {
  return (
    <div className={full ? 'markdown-content min-w-0 max-w-full' : 'line-clamp-3 wrap-anywhere text-sm text-muted-foreground'}>
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ children, href }) => full ? <a href={href} rel="noreferrer">{children}</a> : <span>{children}</span>,
          img: () => null,
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
        }}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}
