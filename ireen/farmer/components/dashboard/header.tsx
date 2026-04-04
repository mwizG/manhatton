'use client';

import { useEffect, useState } from 'react';

export function DashboardHeader() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  return (
    <div className="mb-8 border-b border-border pb-6">
      <h1 className="text-4xl font-bold text-foreground mb-2">Farm Dashboard</h1>
      <p className="text-muted-foreground mb-4">
        Real-time overview of your farm&apos;s financial status, operations, and weather conditions
      </p>
      
      <div className="flex flex-wrap gap-3 items-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Authenticated
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Session Active
        </span>
        {lastUpdated && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </span>
        )}
      </div>
    </div>
  );
}
