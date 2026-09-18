import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-3xl glass-panel p-6 sm:p-10 mb-8 mt-4 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="space-y-3 max-w-2xl relative z-10">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
        {description && <p className="text-lg text-slate-600 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="shrink-0 mt-4 sm:mt-0 relative z-10">{actions}</div>}
    </header>
  );
}
