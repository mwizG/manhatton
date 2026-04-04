'use client';

import { useState } from 'react';
import { FilterState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  activeFilterCount?: number;
}

export function FilterPanel({ onFilterChange, activeFilterCount = 0 }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const selectedFilter = filters.filter_by || '';
  const showAmountRange = selectedFilter === 'amount_spent' || selectedFilter === 'amount_earned';
  const showTextAndDateRange =
    selectedFilter === 'product' || selectedFilter === 'item' || selectedFilter === 'category';
  const showDateRangeOnly = selectedFilter === 'date_range';

  const handleFilterChange = (key: keyof FilterState, value: string | number | undefined) => {
    let newFilters = { ...filters, [key]: value };
    if (key === 'filter_by') {
      newFilters = {
        filter_by: value as string | undefined,
      };
    }
    if (value === undefined || value === '') {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <Card className="mb-8 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter Type
              </label>
              <select
                value={filters.filter_by || ''}
                onChange={(e) => handleFilterChange('filter_by', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select Filter</option>
                <option value="amount_spent">Amount Spent</option>
                <option value="amount_earned">Amount Earned</option>
                <option value="product">Product Sold</option>
                <option value="item">Product Bought</option>
                <option value="category">Category</option>
                <option value="date_range">Date Range</option>
              </select>
            </div>

            {showTextAndDateRange && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Filter Value
                </label>
                <Input
                  type="text"
                  placeholder="Enter product, item, or category"
                  value={filters.filter_value || ''}
                  onChange={(e) => handleFilterChange('filter_value', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>
            )}

            {showAmountRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.filter_value_min || ''}
                    onChange={(e) => handleFilterChange('filter_value_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.filter_value_max || ''}
                    onChange={(e) => handleFilterChange('filter_value_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {(showTextAndDateRange || showDateRangeOnly) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.filter_range_start || ''}
                    onChange={(e) => handleFilterChange('filter_range_start', e.target.value || undefined)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.filter_range_end || ''}
                    onChange={(e) => handleFilterChange('filter_range_end', e.target.value || undefined)}
                    className="text-sm"
                  />
                </div>
              </>
            )}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
