'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ChemicalItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const emptyChemical = {
  name: '',
  active_ingredient: '',
  usage_instructions: '',
  associated_products: '',
};

export default function ChemicalsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  const [chemicals, setChemicals] = useState<ChemicalItem[]>([]);
  const [form, setForm] = useState(emptyChemical);
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

  const loadChemicals = async () => {
    setIsLoading(true);
    setError('');
    try {
      setChemicals(await apiClient.getChemicals());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load chemicals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadChemicals();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setForm(emptyChemical);
    setEditingId('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError('');
    setMessage('');
    try {
      const payload = { ...form, associated_products: form.associated_products || null };
      if (editingId) {
        await apiClient.updateChemical(editingId, payload);
        setMessage('Chemical updated.');
      } else {
        await apiClient.createChemical(payload);
        setMessage('Chemical saved.');
      }
      resetForm();
      await loadChemicals();
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : 'Failed to save chemical');
    }
  };

  const handleEdit = (chemical: ChemicalItem) => {
    setForm({
      name: chemical.name,
      active_ingredient: chemical.active_ingredient,
      usage_instructions: chemical.usage_instructions,
      associated_products: chemical.associated_products || '',
    });
    setEditingId(chemical.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this chemical?')) return;
    setSaveError('');
    setMessage('');
    try {
      await apiClient.deleteChemical(id);
      if (editingId === id) resetForm();
      setMessage('Chemical deleted.');
      await loadChemicals();
    } catch (deleteError) {
      setSaveError(deleteError instanceof Error ? deleteError.message : 'Failed to delete chemical');
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
            <h1 className="text-3xl font-bold text-foreground">Chemicals</h1>
            <p className="text-muted-foreground">Manage chemical records only.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/chemical-tracker">Back to overview</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading chemicals...</p>}

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Update chemical' : 'Add chemical'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3">
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" required />
              <Input value={form.active_ingredient} onChange={(event) => setForm({ ...form, active_ingredient: event.target.value })} placeholder="Active ingredient" required />
              <Input value={form.associated_products} onChange={(event) => setForm({ ...form, associated_products: event.target.value })} placeholder="Associated products" />
              <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.usage_instructions} onChange={(event) => setForm({ ...form, usage_instructions: event.target.value })} placeholder="Usage instructions" required />
              <div className="flex flex-wrap gap-2">
                <Button type="submit">{editingId ? 'Update chemical' : 'Save chemical'}</Button>
                {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All chemicals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chemicals.map((chemical) => (
                <div key={chemical.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{chemical.name}</p>
                    <p className="text-sm text-muted-foreground">{chemical.active_ingredient}</p>
                    <p className="text-sm text-muted-foreground mt-1">{chemical.usage_instructions}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(chemical)}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(chemical.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {chemicals.length === 0 && <p className="text-sm text-muted-foreground">No chemical records yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
