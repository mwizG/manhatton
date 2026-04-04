'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ChemicalItem, TreatmentItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const emptyForm = {
  chemical: '',
  plant: '',
  illness: '',
  treatment_date: '',
  is_preventative: false,
  duration_days: 7,
  times_per_week: 2,
};

export default function TreatmentsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  const [chemicals, setChemicals] = useState<ChemicalItem[]>([]);
  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);
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
      const [chemicalItems, treatmentItems] = await Promise.all([
        apiClient.getChemicals(),
        apiClient.getTreatments(),
      ]);
      setChemicals(chemicalItems);
      setTreatments(treatmentItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load treatments');
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
      const payload = { ...form, chemical: form.chemical };
      if (editingId) {
        await apiClient.updateTreatment(editingId, payload);
        setMessage('Treatment updated.');
      } else {
        await apiClient.createTreatment(payload as never);
        setMessage('Treatment saved.');
      }
      resetForm();
      await loadData();
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : 'Failed to save treatment');
    }
  };

  const handleEdit = (item: TreatmentItem) => {
    setForm({
      chemical: item.chemical,
      plant: item.plant,
      illness: item.illness,
      treatment_date: item.treatment_date,
      is_preventative: item.is_preventative,
      duration_days: item.duration_days,
      times_per_week: item.times_per_week,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this treatment?')) return;
    setSaveError('');
    setMessage('');
    try {
      await apiClient.deleteTreatment(id);
      if (editingId === id) resetForm();
      setMessage('Treatment deleted.');
      await loadData();
    } catch (deleteError) {
      setSaveError(deleteError instanceof Error ? deleteError.message : 'Failed to delete treatment');
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
            <h1 className="text-3xl font-bold text-foreground">Treatments</h1>
            <p className="text-muted-foreground">Manage treatment plans and open each treatment detail separately.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/chemical-tracker">Back to overview</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading treatments...</p>}

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Update treatment' : 'Add treatment'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3">
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.chemical} onChange={(event) => setForm({ ...form, chemical: event.target.value })} required>
                <option value="">Select chemical</option>
                {chemicals.map((chemical) => <option key={chemical.id} value={chemical.id}>{chemical.name}</option>)}
              </select>
              <Input value={form.plant} onChange={(event) => setForm({ ...form, plant: event.target.value })} placeholder="Plant" required />
              <Input value={form.illness} onChange={(event) => setForm({ ...form, illness: event.target.value })} placeholder="Illness" required />
              <Input type="date" value={form.treatment_date} onChange={(event) => setForm({ ...form, treatment_date: event.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" min="1" value={String(form.duration_days)} onChange={(event) => setForm({ ...form, duration_days: Number(event.target.value) })} placeholder="Duration days" />
                <Input type="number" min="1" value={String(form.times_per_week)} onChange={(event) => setForm({ ...form, times_per_week: Number(event.target.value) })} placeholder="Times per week" />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.is_preventative} onChange={(event) => setForm({ ...form, is_preventative: event.target.checked })} />
                Preventative treatment
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button type="submit">{editingId ? 'Update treatment' : 'Save treatment'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All treatments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {treatments.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{item.plant}</p>
                    <p className="text-sm text-muted-foreground">{item.illness} • {item.chemical_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.treatment_date} • {item.duration_days} days • {item.times_per_week}/week</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href={`/chemical-tracker/treatments/${item.id}`}>Details</Link>
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {treatments.length === 0 && <p className="text-sm text-muted-foreground">No treatments yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
