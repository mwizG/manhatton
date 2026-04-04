'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { FinalResultItem, TreatmentItem, TreatmentProgressItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const emptyProgress = {
  treatment: '',
  date: '',
  details: '',
};

const emptyFinalResult = {
  treatment: '',
  date: '',
  observation: '',
  success: false,
  minor_result: false,
  failed: false,
};

export default function TreatmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const treatmentId = params.id;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [treatment, setTreatment] = useState<TreatmentItem | null>(null);
  const [progressItems, setProgressItems] = useState<TreatmentProgressItem[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResultItem[]>([]);
  const [progressForm, setProgressForm] = useState(emptyProgress);
  const [finalResultForm, setFinalResultForm] = useState(emptyFinalResult);
  const [editingProgressId, setEditingProgressId] = useState('');
  const [editingFinalResultId, setEditingFinalResultId] = useState('');

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

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [treatments, progress, results] = await Promise.all([
        apiClient.getTreatments(),
        apiClient.getTreatmentProgress(),
        apiClient.getFinalResults(),
      ]);
      const selected = treatments.find((item) => item.id === treatmentId) || null;
      setTreatment(selected);
      setProgressItems(progress.filter((item) => item.treatment === treatmentId));
      setFinalResults(results.filter((item) => item.treatment === treatmentId));
      setProgressForm((current) => ({ ...current, treatment: treatmentId }));
      setFinalResultForm((current) => ({ ...current, treatment: treatmentId }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load treatment details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && treatmentId) {
      loadData();
    }
  }, [isAuthenticated, treatmentId]);

  const resetProgressForm = () => {
    setProgressForm({ ...emptyProgress, treatment: treatmentId });
    setEditingProgressId('');
  };

  const resetFinalResultForm = () => {
    setFinalResultForm({ ...emptyFinalResult, treatment: treatmentId });
    setEditingFinalResultId('');
  };

  const handleSubmitProgress = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setSaveError('');
    try {
      if (editingProgressId) {
        await apiClient.updateTreatmentProgress(editingProgressId, progressForm);
        setMessage('Progress updated.');
      } else {
        await apiClient.createTreatmentProgress(progressForm);
        setMessage('Progress saved.');
      }
      resetProgressForm();
      await loadData();
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : 'Failed to save progress');
    }
  };

  const handleEditProgress = (item: TreatmentProgressItem) => {
    setProgressForm({ treatment: item.treatment, date: item.date, details: item.details });
    setEditingProgressId(item.id);
  };

  const handleDeleteProgress = async (id: string) => {
    if (!window.confirm('Delete this progress record?')) return;
    setMessage('');
    setSaveError('');
    try {
      await apiClient.deleteTreatmentProgress(id);
      if (editingProgressId === id) resetProgressForm();
      setMessage('Progress deleted.');
      await loadData();
    } catch (deleteError) {
      setSaveError(deleteError instanceof Error ? deleteError.message : 'Failed to delete progress');
    }
  };

  const handleSubmitFinalResult = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setSaveError('');
    try {
      const payload = { ...finalResultForm, treatment: treatmentId };
      if (editingFinalResultId) {
        await apiClient.updateFinalResult(editingFinalResultId, payload);
        setMessage('Final result updated.');
      } else {
        await apiClient.createFinalResult(payload);
        setMessage('Final result saved.');
      }
      resetFinalResultForm();
      await loadData();
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : 'Failed to save final result');
    }
  };

  const handleEditFinalResult = (item: FinalResultItem) => {
    setFinalResultForm({
      treatment: item.treatment,
      date: item.date,
      observation: item.observation,
      success: item.success,
      minor_result: item.minor_result,
      failed: item.failed,
    });
    setEditingFinalResultId(item.id);
  };

  const handleDeleteFinalResult = async (id: string) => {
    if (!window.confirm('Delete this final result?')) return;
    setMessage('');
    setSaveError('');
    try {
      await apiClient.deleteFinalResult(id);
      if (editingFinalResultId === id) resetFinalResultForm();
      setMessage('Final result deleted.');
      await loadData();
    } catch (deleteError) {
      setSaveError(deleteError instanceof Error ? deleteError.message : 'Failed to delete final result');
    }
  };

  const outcomeLabel = useMemo(() => {
    if (!treatment) return 'Pending';
    const finalResult = finalResults[0];
    if (!finalResult) return 'Pending';
    if (finalResult.success) return 'Success';
    if (finalResult.minor_result) return 'Minor result';
    if (finalResult.failed) return 'Failed';
    return 'Pending';
  }, [treatment, finalResults]);

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-background px-4 py-6 text-muted-foreground">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chemical tracker</p>
            <h1 className="text-3xl font-bold text-foreground">Treatment detail</h1>
            <p className="text-muted-foreground">Progress and final result live here for one treatment at a time.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/chemical-tracker/treatments">Back to treatments</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading treatment detail...</p>}

        {treatment ? (
          <Card>
            <CardHeader>
              <CardTitle>{treatment.plant} • {treatment.illness}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground">Chemical:</span> {treatment.chemical_name}</p>
              <p><span className="text-foreground">Treatment date:</span> {treatment.treatment_date}</p>
              <p><span className="text-foreground">Duration:</span> {treatment.duration_days} days</p>
              <p><span className="text-foreground">Times per week:</span> {treatment.times_per_week}</p>
              <p><span className="text-foreground">Preventative:</span> {treatment.is_preventative ? 'Yes' : 'No'}</p>
              <p><span className="text-foreground">Outcome:</span> {outcomeLabel}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">Treatment not found.</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingProgressId ? 'Update progress' : 'Add progress'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProgress} className="grid gap-3">
                <Input type="date" value={progressForm.date} onChange={(event) => setProgressForm({ ...progressForm, date: event.target.value })} required />
                <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={progressForm.details} onChange={(event) => setProgressForm({ ...progressForm, details: event.target.value })} placeholder="Progress details" required />
                <div className="flex gap-2 flex-wrap">
                  <Button type="submit">{editingProgressId ? 'Update progress' : 'Save progress'}</Button>
                  {editingProgressId && <Button type="button" variant="outline" onClick={resetProgressForm}>Cancel</Button>}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{editingFinalResultId ? 'Update final result' : 'Add final result'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFinalResult} className="grid gap-3">
                <Input type="date" value={finalResultForm.date} onChange={(event) => setFinalResultForm({ ...finalResultForm, date: event.target.value })} required />
                <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={finalResultForm.observation} onChange={(event) => setFinalResultForm({ ...finalResultForm, observation: event.target.value })} placeholder="Observation" required />
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={finalResultForm.success} onChange={(event) => setFinalResultForm({ ...finalResultForm, success: event.target.checked, minor_result: false, failed: false })} /> Success</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={finalResultForm.minor_result} onChange={(event) => setFinalResultForm({ ...finalResultForm, minor_result: event.target.checked, success: false, failed: false })} /> Minor result</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={finalResultForm.failed} onChange={(event) => setFinalResultForm({ ...finalResultForm, failed: event.target.checked, success: false, minor_result: false })} /> Failed</label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button type="submit">{editingFinalResultId ? 'Update final result' : 'Save final result'}</Button>
                  {editingFinalResultId && <Button type="button" variant="outline" onClick={resetFinalResultForm}>Cancel</Button>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Treatment progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progressItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{item.date}</p>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEditProgress(item)}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDeleteProgress(item.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {progressItems.length === 0 && <p className="text-sm text-muted-foreground">No progress records yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Final results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {finalResults.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{item.date || 'No date'}</p>
                    <p className="text-sm text-muted-foreground">{item.observation}</p>
                    <p className="text-sm text-muted-foreground">{item.success ? 'Success' : item.minor_result ? 'Minor result' : item.failed ? 'Failed' : 'Pending'}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEditFinalResult(item)}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDeleteFinalResult(item.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {finalResults.length === 0 && <p className="text-sm text-muted-foreground">No final result recorded yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
