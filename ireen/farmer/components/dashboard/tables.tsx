'use client';

import { ExpenseItem, SalesItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface TablesProps {
  expenses?: ExpenseItem[];
  sales?: SalesItem[];
  isLoading: boolean;
  error?: string;
  onAddExpense?: () => void;
  onEditExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense?: (id: string) => void;
  onAddSale?: () => void;
  onEditSale?: (sale: SalesItem) => void;
  onDeleteSale?: (id: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-muted rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}

function ExpenseTable({ 
  items, 
  isLoading, 
  error,
  onAdd,
  onEdit,
  onDelete
}: { 
  items?: ExpenseItem[]; 
  isLoading: boolean; 
  error?: string;
  onAdd?: () => void;
  onEdit?: (expense: ExpenseItem) => void;
  onDelete?: (id: string) => void;
}) {
  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">Expenses</CardTitle>
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition"
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load expenses</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">Expenses</CardTitle>
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition"
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No expenses found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="expenses">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">Expenses ({items.length})</CardTitle>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition"
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-foreground">Item</th>
                <th className="text-left py-3 px-2 font-medium text-foreground">Category</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Qty</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Amount</th>
                <th className="text-left py-3 px-2 font-medium text-foreground">Date</th>
                {(onEdit || onDelete) && <th className="text-center py-3 px-2 font-medium text-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 10).map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-foreground">{item.item}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{item.category}</td>
                  <td className="py-3 px-2 text-right text-muted-foreground">{item.quantity}{item.unit && ` ${item.unit}`}</td>
                  <td className="py-3 px-2 text-right font-medium text-destructive">{formatCurrency(item.amount)}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{formatDate(item.date)}</td>
                  {(onEdit || onDelete) && (
                    <td className="py-3 px-2 text-center flex justify-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1 hover:bg-blue-100 text-blue-600 rounded transition" title="Edit">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-1 hover:bg-red-100 text-red-600 rounded transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length > 10 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">Showing 10 of {items.length} expenses</p>
        )}
      </CardContent>
    </Card>
  );
}

function SalesTable({ 
  items, 
  isLoading, 
  error,
  onAdd,
  onEdit,
  onDelete
}: { 
  items?: SalesItem[]; 
  isLoading: boolean; 
  error?: string;
  onAdd?: () => void;
  onEdit?: (sale: SalesItem) => void;
  onDelete?: (id: string) => void;
}) {
  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load sales</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">Sales</CardTitle>
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No sales found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="sales">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">Sales ({items.length})</CardTitle>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-foreground">Item</th>
                <th className="text-left py-3 px-2 font-medium text-foreground">Category</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Qty</th>
                <th className="text-right py-3 px-2 font-medium text-foreground">Amount</th>
                <th className="text-left py-3 px-2 font-medium text-foreground">Date</th>
                {(onEdit || onDelete) && <th className="text-center py-3 px-2 font-medium text-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 10).map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-foreground">{item.item}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{item.category}</td>
                  <td className="py-3 px-2 text-right text-muted-foreground">{item.quantity}{item.unit && ` ${item.unit}`}</td>
                  <td className="py-3 px-2 text-right font-medium text-green-600 dark:text-green-400">{formatCurrency(item.amount)}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{formatDate(item.date)}</td>
                  {(onEdit || onDelete) && (
                    <td className="py-3 px-2 text-center flex justify-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1 hover:bg-blue-100 text-blue-600 rounded transition" title="Edit">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-1 hover:bg-red-100 text-red-600 rounded transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length > 10 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">Showing 10 of {items.length} sales</p>
        )}
      </CardContent>
    </Card>
  );
}

export function Tables({ 
  expenses, 
  sales, 
  isLoading, 
  error,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onAddSale,
  onEditSale,
  onDeleteSale,
}: TablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ExpenseTable 
        items={expenses} 
        isLoading={isLoading} 
        error={error}
        onAdd={onAddExpense}
        onEdit={onEditExpense}
        onDelete={onDeleteExpense}
      />
      <SalesTable 
        items={sales} 
        isLoading={isLoading} 
        error={error}
        onAdd={onAddSale}
        onEdit={onEditSale}
        onDelete={onDeleteSale}
      />
    </div>
  );
}
