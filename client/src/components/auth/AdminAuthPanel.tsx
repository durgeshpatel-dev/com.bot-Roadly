import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { ShieldCheck } from 'lucide-react';

interface AdminAuthPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AdminAuthPanel({ title, description, children, className }: AdminAuthPanelProps) {
  return (
    <div className="auth-shell relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/25 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent pointer-events-none" />
      <Card className={cn('auth-card glass-panel shadow-2xl z-10 border-violet-500/20 dark:border-violet-400/15', className)}>
        <CardContent className="space-y-6 p-6 sm:p-10">
          <div className="text-center space-y-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <ShieldCheck className="size-7" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500 dark:text-violet-400">Admin Portal</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-50">{title}</h1>
            {description && <p className="text-base text-slate-500">{description}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
