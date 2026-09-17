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
    <div className="auth-shell">
      <Card className={cn('auth-card', className)}>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
