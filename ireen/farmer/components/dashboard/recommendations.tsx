'use client';

import { ChemicalRecommendation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsProps {
  recommendations?: ChemicalRecommendation[];
  isLoading: boolean;
  error?: string;
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}

export function Recommendations({ recommendations = [], isLoading, error }: RecommendationsProps) {
  if (error) {
    return (
      <Card className="mb-8 border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Chemical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Chemical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendationSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Chemical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No chemical recommendations available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by success rate (highest first)
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => b.success_rate - a.success_rate
  );

  return (
    <Card id="recommendations" className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Chemical Recommendations ({recommendations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-foreground">Chemical</th>
                <th className="text-left py-3 px-2 font-medium text-foreground">Plant</th>
                <th className="text-left py-3 px-2 font-medium text-foreground">Illness</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Success Rate</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Minor Result</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Count</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecommendations.slice(0, 10).map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium text-foreground">{rec.chemical}</td>
                  <td className="py-3 px-2 text-muted-foreground">{rec.plant}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{rec.illness}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {(rec.success_rate * 100).toFixed(0)}%
                      </span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 dark:bg-green-400 transition-all rounded-full"
                          style={{ width: `${rec.success_rate * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {(rec.minor_result_rate * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">{rec.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recommendations.length > 10 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Showing 10 of {recommendations.length} recommendations
          </p>
        )}
      </CardContent>
    </Card>
  );
}
