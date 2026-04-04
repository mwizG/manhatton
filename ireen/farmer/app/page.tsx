'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogbookSummary, FilterState, ExpenseItem, SalesItem, ChemicalRecommendation } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { DashboardHeader } from '@/components/dashboard/header';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { FilterPanel } from '@/components/dashboard/filter-panel';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { Tables } from '@/components/dashboard/tables';
import { Recommendations } from '@/components/dashboard/recommendations';
import { WeatherPanel } from '@/components/dashboard/weather-panel';
import { Dialog } from '@/components/dialog';
import { ExpenseForm } from '@/components/forms/expense-form';
import { SalesForm } from '@/components/forms/sales-form';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<LogbookSummary | undefined>();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [sales, setSales] = useState<SalesItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string>('');

  const [recommendations, setRecommendations] = useState<ChemicalRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState<string>('');

  const [filters, setFilters] = useState<FilterState>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [salesFormOpen, setSalesFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | undefined>();
  const [selectedSale, setSelectedSale] = useState<SalesItem | undefined>();

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof FilterState]
  ).length;

  const fetchDashboardData = useCallback(async (filterState: FilterState) => {
    setIsLoadingData(true);
    setDataError('');
    try {
      const result = await apiClient.getDashboardSnapshot(filterState);
      setData(result.summary);
      setExpenses(result.expenses);
      setSales(result.sales);
    } catch (error) {
      setData(undefined);
      setExpenses([]);
      setSales([]);
      setDataError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

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

    const fetchRecommendations = async () => {
      setIsLoadingRecs(true);
      setRecsError('');
      try {
        const result = await apiClient.getChemicalRecommendations();
        setRecommendations(result);
      } catch (error) {
        setRecsError(error instanceof Error ? error.message : 'Failed to load recommendations');
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDashboardData(filters);
  }, [filters, fetchDashboardData, isAuthenticated]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setSelectedExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await apiClient.deleteExpense(id);
    fetchDashboardData(filters);
  };

  const handleAddSale = () => {
    setSelectedSale(undefined);
    setSalesFormOpen(true);
  };

  const handleEditSale = (sale: SalesItem) => {
    setSelectedSale(sale);
    setSalesFormOpen(true);
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    await apiClient.deleteSale(id);
    fetchDashboardData(filters);
  };

  const handleFormSuccess = () => {
    fetchDashboardData(filters);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <p className="text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <DashboardHeader />

        <KPICards data={data} isLoading={isLoadingData} error={dataError} />

        <FilterPanel onFilterChange={handleFilterChange} activeFilterCount={activeFilterCount} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TrendChart
            title="Expense Trends"
            trends={data?.expense_trends}
            isLoading={isLoadingData}
            error={dataError}
            colorClass="bg-destructive"
          />
          <TrendChart
            title="Sales Trends"
            trends={data?.sales_trends}
            isLoading={isLoadingData}
            error={dataError}
            colorClass="bg-green-600 dark:bg-green-400"
          />
        </div>

        <Tables
          expenses={expenses}
          sales={sales}
          isLoading={isLoadingData}
          error={dataError}
          onAddExpense={handleAddExpense}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onAddSale={handleAddSale}
          onEditSale={handleEditSale}
          onDeleteSale={handleDeleteSale}
        />

        <Recommendations
          recommendations={recommendations}
          isLoading={isLoadingRecs}
          error={recsError}
        />

        <WeatherPanel defaultCity="Lusaka" defaultCountry="ZM" />

        <Dialog
          isOpen={expenseFormOpen}
          onClose={() => {
            setExpenseFormOpen(false);
            setSelectedExpense(undefined);
          }}
          size="md"
        >
          <ExpenseForm
            expense={selectedExpense}
            onClose={() => {
              setExpenseFormOpen(false);
              setSelectedExpense(undefined);
            }}
            onSuccess={handleFormSuccess}
          />
        </Dialog>

        <Dialog
          isOpen={salesFormOpen}
          onClose={() => {
            setSalesFormOpen(false);
            setSelectedSale(undefined);
          }}
          size="md"
        >
          <SalesForm
            sale={selectedSale}
            onClose={() => {
              setSalesFormOpen(false);
              setSelectedSale(undefined);
            }}
            onSuccess={handleFormSuccess}
          />
        </Dialog>
      </div>
    </div>
  );
}
