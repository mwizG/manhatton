'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  ChemicalItem,
  FinalResultItem,
  TrackerRecommendation,
  TreatmentItem,
  TreatmentProgressItem,
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function UnitCard({ title, count, href, description }: { title: string; count: number; href: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span>{title}</span>
          <span className="text-2xl">{count}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild>
          <Link href={href}>Open {title}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export default function ChemicalTrackerOverviewPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chemicals, setChemicals] = useState<ChemicalItem[]>([]);
  const [recommendations, setRecommendations] = useState<TrackerRecommendation[]>([]);
  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);
  const [progress, setProgress] = useState<TreatmentProgressItem[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResultItem[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.getProfile();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        router.replace('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadOverview = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [chemicalItems, recommendationItems, treatmentItems, progressItems, finalResultItems] = await Promise.all([
          apiClient.getChemicals(),
          apiClient.getTrackerRecommendations(),
          apiClient.getTreatments(),
          apiClient.getTreatmentProgress(),
          apiClient.getFinalResults(),
        ]);
        setChemicals(chemicalItems);
        setRecommendations(recommendationItems);
        setTreatments(treatmentItems);
        setProgress(progressItems);
        setFinalResults(finalResultItems);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load tracker overview');
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, [isAuthenticated]);

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-background px-4 py-6 text-muted-foreground">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chemical tracker</p>
          <h1 className="text-3xl font-bold text-foreground">Tracker overview</h1>
          <p className="max-w-3xl text-muted-foreground">
            The tracker is now split into focused units so each workflow stays easier to understand.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading tracker data...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <UnitCard
            title="Chemicals"
            count={chemicals.length}
            href="/chemical-tracker/chemicals"
            description="Manage chemical records and usage details."
          />
          <UnitCard
            title="Recommendations"
            count={recommendations.length}
            href="/chemical-tracker/recommendations"
            description="Record recommendation outcomes and review patterns."
          />
          <UnitCard
            title="Treatments"
            count={treatments.length}
            href="/chemical-tracker/treatments"
            description="Manage treatment plans by plant and illness."
          />
          <UnitCard
            title="Results"
            count={finalResults.length}
            href="/chemical-tracker/treatments"
            description="Open a treatment to review its progress and result."
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ListCard title="Recent chemicals">
            {chemicals.slice(0, 5).map((chemical) => (
              <div key={chemical.id} className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{chemical.name}</p>
                  <p className="text-sm text-muted-foreground">{chemical.active_ingredient}</p>
                </div>
                <Link className="text-sm text-primary hover:underline" href="/chemical-tracker/chemicals">Open</Link>
              </div>
            ))}
            {chemicals.length === 0 && <p className="text-sm text-muted-foreground">No chemical records yet.</p>}
          </ListCard>

          <ListCard title="Recent treatments">
            {treatments.slice(0, 5).map((treatment) => (
              <div key={treatment.id} className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{treatment.plant}</p>
                  <p className="text-sm text-muted-foreground">{treatment.illness} • {treatment.chemical_name}</p>
                </div>
                <Link className="text-sm text-primary hover:underline" href={`/chemical-tracker/treatments/${treatment.id}`}>Details</Link>
              </div>
            ))}
            {treatments.length === 0 && <p className="text-sm text-muted-foreground">No treatments yet.</p>}
          </ListCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ListCard title="Recent recommendations">
            {recommendations.slice(0, 5).map((recommendation) => (
              <div key={recommendation.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">{recommendation.chemical_name}</p>
                <p className="text-sm text-muted-foreground">{recommendation.plant} • {recommendation.illness}</p>
              </div>
            ))}
            {recommendations.length === 0 && <p className="text-sm text-muted-foreground">No recommendations yet.</p>}
          </ListCard>

          <ListCard title="Progress and final results">
            <div className="space-y-3">
              {progress.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4">
                  <p className="font-medium text-foreground">Progress for treatment {item.treatment}</p>
                  <p className="text-sm text-muted-foreground">{item.date} • {item.details}</p>
                </div>
              ))}
              {finalResults.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4">
                  <p className="font-medium text-foreground">Final result for treatment {item.treatment}</p>
                  <p className="text-sm text-muted-foreground">{item.date} • {item.success ? 'Success' : item.minor_result ? 'Minor result' : item.failed ? 'Failed' : 'Pending'}</p>
                </div>
              ))}
              {progress.length === 0 && finalResults.length === 0 && <p className="text-sm text-muted-foreground">No progress or final results yet.</p>}
            </div>
          </ListCard>
        </div>
      </div>
    </div>
  );
}
