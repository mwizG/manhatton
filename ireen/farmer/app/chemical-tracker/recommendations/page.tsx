'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ChemicalItem, TrackerRecommendation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const emptyForm = {
  chemical: '',
  recommended_date: '',
  reason: '',
  result: 'success',
  plant: '',
  illness: '',
  success: true,
  minor_result: false,
};

export default function RecommendationsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  const [chemicals, setChemicals] = useState<ChemicalItem[]>([]);
  const [recommendations, setRecommendations] = useState<TrackerRecommendation[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');

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
      const [chemicalItems, recommendationItems] = await Promise.all([
        apiClient.getChemicals(),
        apiClient.getTrackerRecommendations(),
      ]);
      setChemicals(chemicalItems);
      setRecommendations(recommendationItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError('');
    setMessage('');
    try {
      const payload = {
        chemical: form.chemical,
        recommended_date: form.recommended_date,
        reason: form.reason,
        result: form.result,
        plant: form.plant,
        illness: form.illness,
        success: form.result === 'success',
        minor_result: form.result === 'minor_result',
      };
      if (editingId) {
        await apiClient.updateTrackerRecommendation(editingId, payload);
        setMessage('Recommendation updated.');
      } else {
        await apiClient.createTrackerRecommendation(payload as never);
        setMessage('Recommendation saved.');
      }
      resetForm();
      await loadData();
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : 'Failed to save recommendation');
    }
  };

  const handleEdit = (item: TrackerRecommendation) => {
    setForm({
      chemical: item.chemical,
      recommended_date: item.recommended_date,
      reason: item.reason,
      result: item.result,
      plant: item.plant,
      illness: item.illness,
      success: item.success,
      minor_result: item.minor_result,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this recommendation?')) return;
    setSaveError('');
    setMessage('');
    try {
      await apiClient.deleteTrackerRecommendation(id);
      if (editingId === id) resetForm();
      setMessage('Recommendation deleted.');
      await loadData();
    } catch (deleteError) {
      setSaveError(deleteError instanceof Error ? deleteError.message : 'Failed to delete recommendation');
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
            <p className="text-muted-foreground">Record and manage recommendation outcomes only.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/chemical-tracker">Back to overview</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading recommendations...</p>}

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Update recommendation' : 'Add recommendation'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3">
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.chemical} onChange={(event) => setForm({ ...form, chemical: event.target.value })} required>
                <option value="">Select chemical</option>
                {chemicals.map((chemical) => <option key={chemical.id} value={chemical.id}>{chemical.name}</option>)}
              </select>
              <Input type="date" value={form.recommended_date} onChange={(event) => setForm({ ...form, recommended_date: event.target.value })} required />
              <Input value={form.plant} onChange={(event) => setForm({ ...form, plant: event.target.value })} placeholder="Plant" required />
              <Input value={form.illness} onChange={(event) => setForm({ ...form, illness: event.target.value })} placeholder="Illness" required />
              <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Reason" required />
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.result} onChange={(event) => setForm({ ...form, result: event.target.value })}>
                <option value="success">Success</option>
                <option value="minor_result">Minor result</option>
                <option value="failed">Failed</option>
              </select>
              <div className="flex gap-2 flex-wrap">
                <Button type="submit">{editingId ? 'Update recommendation' : 'Save recommendation'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{item.chemical_name}</p>
                    <p className="text-sm text-muted-foreground">{item.plant} • {item.illness}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.result}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && <p className="text-sm text-muted-foreground">No recommendations yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
