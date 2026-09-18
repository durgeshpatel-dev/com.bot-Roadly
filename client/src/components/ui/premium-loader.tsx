import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  fullScreen?: boolean;
}

export function PremiumLoader({ fullScreen = false, className, ...props }: PremiumLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
      role="status"
      aria-label="Loading"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/20 opacity-75 blur-md" style={{ animationDuration: '3s' }} />
        
        {/* Spinning gradient border */}
        <div className="relative size-16 rounded-full p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-spin" style={{ animationDuration: '1.5s' }}>
          {/* Inner dark core */}
          <div className="size-full rounded-full bg-background flex items-center justify-center">
            {/* Pulsing center dot */}
            <div className="size-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 animate-pulse" />
          </div>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
        Loading...
      </span>
    </div>
  );
}
