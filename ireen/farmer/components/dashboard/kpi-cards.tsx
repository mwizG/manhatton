'use client';

import { LogbookSummary } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardsProps {
  data?: LogbookSummary;
  isLoading: boolean;
  error?: string;
}

function formatCurrency(value: number, currency = 'ZMW'): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function KPISkeleton() {
  return (
    <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
  );
}

export function KPICards({ data, isLoading, error }: KPICardsProps) {
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-destructive">Failed to load metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KPISkeleton />
        <KPISkeleton />
        <KPISkeleton />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const profitLossColor = data.profit_loss >= 0 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-destructive';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Spent */}
      <Card className="border-destructive/20 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">
            {formatCurrency(data.total_spent, data.currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Expenses this period</p>
        </CardContent>
      </Card>

      {/* Total Earned */}
      <Card className="border-green-600/20 dark:border-green-500/20 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.total_earned, data.currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Revenue this period</p>
        </CardContent>
      </Card>

      {/* Profit/Loss */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profit/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${profitLossColor}`}>
            {formatCurrency(data.profit_loss, data.currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.profit_loss >= 0 ? 'Positive margin' : 'Operating loss'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
