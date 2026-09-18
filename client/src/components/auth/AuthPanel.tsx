import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface AuthPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AuthPanel({ title, description, children, className }: AuthPanelProps) {
  return (
    <div className="auth-shell relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-background to-background pointer-events-none" />
      <Card className={cn('auth-card glass-panel shadow-2xl z-10', className)}>
        <CardContent className="space-y-6 p-6 sm:p-10">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-50">{title}</h1>
            {description && <p className="text-base text-slate-500">{description}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
