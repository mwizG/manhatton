import {
  LogbookSummary,
  ChemicalRecommendation,
  WeatherData,
  FilterState,
  ExpenseItem,
  SalesItem,
  AuthProfile,
  ChemicalItem,
  TrackerRecommendation,
  TreatmentItem,
  TreatmentProgressItem,
  FinalResultItem,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || '';
const CSRF_COOKIE_NAME = 'csrftoken';

type LogbookQueryFilters = FilterState & {
  limit?: number;
  offset?: number;
  category?: string;
};

type BackendSummaryResponse = {
  totals?: {
    spent?: number;
    earned?: number;
    profit?: number;
    currency?: string;
  };
  series?: {
    expenses?: Array<{ date: string; total_spent: number }>;
    sales?: Array<{ date: string; total_earned: number }>;
  };
  filters?: Record<string, string>;
};

type BackendExpense = {
  id: number | string;
  item: string;
  amount_spent: number | string;
  quantity?: number | null;
  category?: string | null;
  date: string;
};

type BackendSale = {
  id: number | string;
  product: string;
  amount_earned: number | string;
  quantity?: number | null;
  category?: string | null;
  date: string;
};

type BackendRecommendation = {
  chemical_id?: number | string;
  chemical__name?: string;
  plant: string;
  illness: string;
  total_count: number;
  success_rate: number;
  minor_result_rate?: number;
};

type BackendChemical = {
  id: number | string;
  name: string;
  active_ingredient: string;
  usage_instructions: string;
  associated_products?: string | null;
};

type BackendTreatment = {
  id: number | string;
  chemical: number | string;
  chemical_name?: string;
  plant: string;
  illness: string;
  treatment_date: string;
  is_preventative: boolean;
  duration_days: number;
  times_per_week: number;
};

type BackendTreatmentProgress = {
  id: number | string;
  treatment: number | string;
  date: string;
  details: string;
};

type BackendFinalResult = {
  id: number | string;
  treatment: number | string;
  date?: string | null;
  observation?: string | null;
  success: boolean;
  minor_result: boolean;
  failed: boolean;
};

type BackendWeatherResponse = {
  city?: string;
  country?: string;
  data?: {
    name?: string;
    sys?: { country?: string };
    main?: { temp?: number; humidity?: number };
    wind?: { speed?: number };
    weather?: Array<{ description?: string }>;
  };
};

class ApiErrorClass extends Error {
  status?: number;
  details?: string;

  constructor(message: string, status?: number, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const cookieValue = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1];

  return cookieValue ? decodeURIComponent(cookieValue) : undefined;
}

let csrfInitPromise: Promise<void> | null = null;

async function ensureCsrfCookie(): Promise<void> {
  if (typeof document === 'undefined') return;
  if (getCookie(CSRF_COOKIE_NAME)) return;

  if (!csrfInitPromise) {
    csrfInitPromise = fetch('/api/csrf', {
      credentials: 'include',
    })
      .then(() => undefined)
      .finally(() => {
        csrfInitPromise = null;
      });
  }

  await csrfInitPromise;
}

function normalizeId(id: number | string): string {
  return String(id);
}

function normalizeNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : value ?? 0;
  return Number.isFinite(parsed) ? Number(parsed) : 0;
}

function normalizeExpense(item: BackendExpense): ExpenseItem {
  return {
    id: normalizeId(item.id),
    item: item.item,
    category: item.category || '',
    quantity: item.quantity ?? 0,
    amount: normalizeNumber(item.amount_spent),
    date: item.date,
    unit: undefined,
  };
}

function normalizeSale(item: BackendSale): SalesItem {
  return {
    id: normalizeId(item.id),
    item: item.product,
    category: item.category || '',
    quantity: item.quantity ?? 0,
    amount: normalizeNumber(item.amount_earned),
    date: item.date,
    unit: undefined,
  };
}

function normalizeRecommendation(item: BackendRecommendation): ChemicalRecommendation {
  const chemicalId = normalizeId(item.chemical_id ?? item.chemical__name ?? 'chemical');
  const plantSlug = item.plant || 'plant';
  const illnessSlug = item.illness || 'illness';

  return {
    id: `${chemicalId}-${plantSlug}-${illnessSlug}`,
    chemical: item.chemical__name || 'Unknown chemical',
    plant: item.plant,
    illness: item.illness,
    success_rate: normalizeNumber(item.success_rate) / 100,
    minor_result_rate: normalizeNumber(item.minor_result_rate) / 100,
    count: item.total_count,
  };
}

function normalizeChemical(item: BackendChemical): ChemicalItem {
  return {
    id: normalizeId(item.id),
    name: item.name,
    active_ingredient: item.active_ingredient,
    usage_instructions: item.usage_instructions,
    associated_products: item.associated_products || null,
  };
}

function normalizeTrackerRecommendation(item: TrackerRecommendation | (BackendRecommendation & { chemical_name?: string })): TrackerRecommendation {
  const source = item as TrackerRecommendation;
  return {
    id: normalizeId(source.id),
    chemical: source.chemical,
    chemical_name: source.chemical_name,
    recommended_date: source.recommended_date,
    reason: source.reason,
    result: source.result,
    plant: source.plant,
    illness: source.illness,
    success: Boolean(source.success),
    minor_result: Boolean(source.minor_result),
  };
}

function normalizeTreatment(item: BackendTreatment): TreatmentItem {
  return {
    id: normalizeId(item.id),
    chemical: normalizeId(item.chemical),
    chemical_name: item.chemical_name || '',
    plant: item.plant,
    illness: item.illness,
    treatment_date: item.treatment_date,
    is_preventative: Boolean(item.is_preventative),
    duration_days: normalizeNumber(item.duration_days),
    times_per_week: normalizeNumber(item.times_per_week),
  };
}

function normalizeTreatmentProgress(item: BackendTreatmentProgress): TreatmentProgressItem {
  return {
    id: normalizeId(item.id),
    treatment: normalizeId(item.treatment),
    date: item.date,
    details: item.details,
  };
}

function normalizeFinalResult(item: BackendFinalResult): FinalResultItem {
  return {
    id: normalizeId(item.id),
    treatment: normalizeId(item.treatment),
    date: item.date || '',
    observation: item.observation || '',
    success: Boolean(item.success),
    minor_result: Boolean(item.minor_result),
    failed: Boolean(item.failed),
  };
}

function normalizeWeather(data: BackendWeatherResponse): WeatherData {
  const weather = data.data;
  const city = weather?.name || data.city || 'Unknown';
  const country = weather?.sys?.country || data.country || '';
  const temp = weather?.main?.temp ?? 0;
  const humidity = weather?.main?.humidity ?? 0;
  const windSpeed = weather?.wind?.speed ?? 0;
  const condition = weather?.weather?.[0]?.description || 'Unknown';

  return {
    location: { city, country },
    current: {
      temperature: normalizeNumber(temp),
      humidity: normalizeNumber(humidity),
      wind_speed: normalizeNumber(windSpeed),
      condition,
    },
    timestamp: new Date().toISOString(),
  };
}

function appendFilters(params: URLSearchParams, filters?: LogbookQueryFilters) {
  if (!filters) return;

  if (filters.filter_by) params.append('filter_by', filters.filter_by);
  if (filters.filter_value) params.append('filter_value', filters.filter_value);
  if (filters.filter_value_min !== undefined) {
    params.append('filter_value_min', String(filters.filter_value_min));
  }
  if (filters.filter_value_max !== undefined) {
    params.append('filter_value_max', String(filters.filter_value_max));
  }
  if (filters.filter_range_start) {
    params.append('filter_range_start', filters.filter_range_start);
  }
  if (filters.filter_range_end) {
    params.append('filter_range_end', filters.filter_range_end);
  }
  if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters.offset !== undefined) params.append('offset', String(filters.offset));
  if (filters.category) params.append('category', filters.category);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    const method = (options?.method || 'GET').toUpperCase();
    const isUnsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (isUnsafeMethod) {
      await ensureCsrfCookie();
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for Django session auth
      headers: {
        'Content-Type': 'application/json',
        ...(isUnsafeMethod && typeof document !== 'undefined'
          ? { 'X-CSRFToken': getCookie(CSRF_COOKIE_NAME) || '' }
          : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const data = await parseResponseBody(response).catch(() => ({}));
      throw new ApiErrorClass(
        typeof data === 'object' && data && 'detail' in data
          ? String((data as { detail?: unknown }).detail)
          : `API Error: ${response.statusText}`,
        response.status,
        JSON.stringify(data)
      );
    }

    return (await parseResponseBody(response)) as T;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error;
    }

    throw new ApiErrorClass(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

export const apiClient = {
  async getLogbookSummary(filters?: LogbookQueryFilters): Promise<LogbookSummary> {
    const params = new URLSearchParams();
    appendFilters(params, filters);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/logbook/summary?${queryString}`
      : '/api/logbook/summary';

    const data = await fetchApi<BackendSummaryResponse>(endpoint);

    const expensesSeries = data.series?.expenses || [];
    const salesSeries = data.series?.sales || [];

    return {
      total_spent: normalizeNumber(data.totals?.spent),
      total_earned: normalizeNumber(data.totals?.earned),
      profit_loss: normalizeNumber(data.totals?.profit),
      currency: data.totals?.currency || 'ZMW',
      expenses: [],
      sales: [],
      expense_trends: expensesSeries.map((item) => ({
        name: item.date,
        value: normalizeNumber(item.total_spent),
      })),
      sales_trends: salesSeries.map((item) => ({
        name: item.date,
        value: normalizeNumber(item.total_earned),
      })),
    };
  },

  async getDashboardSnapshot(filters?: LogbookQueryFilters) {
    const [summary, expenseResponse, saleResponse] = await Promise.all([
      this.getLogbookSummary(filters),
      this.getExpenses(filters),
      this.getSales(filters),
    ]);

    return {
      summary,
      expenses: expenseResponse.results,
      sales: saleResponse.results,
    };
  },

  async getChemicalRecommendations(): Promise<ChemicalRecommendation[]> {
    const data = await fetchApi<{
      suggestions?: BackendRecommendation[];
      data?: BackendRecommendation[];
    }>('/api/chemical-tracker/suggestions');

    const suggestions = data.suggestions || data.data || [];
    return suggestions.map(normalizeRecommendation);
  },

  async getChemicals(): Promise<ChemicalItem[]> {
    const data = await fetchApi<{ results?: BackendChemical[] }>(`/api/chemical-tracker/chemicals`);
    return (data.results || []).map(normalizeChemical);
  },

  async createChemical(payload: Omit<ChemicalItem, 'id'>): Promise<ChemicalItem> {
    const created = await fetchApi<BackendChemical>(`/api/chemical-tracker/chemicals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeChemical(created);
  },

  async updateChemical(id: string, payload: Partial<Omit<ChemicalItem, 'id'>>): Promise<ChemicalItem> {
    const updated = await fetchApi<BackendChemical>(`/api/chemical-tracker/chemicals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeChemical(updated);
  },

  async deleteChemical(id: string): Promise<void> {
    await fetchApi<void>(`/api/chemical-tracker/chemicals/${id}`, {
      method: 'DELETE',
    });
  },

  async getTrackerRecommendations(): Promise<TrackerRecommendation[]> {
    const data = await fetchApi<{ results?: TrackerRecommendation[] }>(`/api/chemical-tracker/recommendations`);
    return (data.results || []).map(normalizeTrackerRecommendation);
  },

  async createTrackerRecommendation(payload: Omit<TrackerRecommendation, 'id' | 'chemical_name'> & { chemical: string }): Promise<TrackerRecommendation> {
    const created = await fetchApi<TrackerRecommendation>(`/api/chemical-tracker/recommendations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTrackerRecommendation(created);
  },

  async updateTrackerRecommendation(id: string, payload: Partial<Omit<TrackerRecommendation, 'id' | 'chemical_name'>> & { chemical?: string }): Promise<TrackerRecommendation> {
    const updated = await fetchApi<TrackerRecommendation>(`/api/chemical-tracker/recommendations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeTrackerRecommendation(updated);
  },

  async deleteTrackerRecommendation(id: string): Promise<void> {
    await fetchApi<void>(`/api/chemical-tracker/recommendations/${id}`, {
      method: 'DELETE',
    });
  },

  async getTreatments(): Promise<TreatmentItem[]> {
    const data = await fetchApi<{ results?: BackendTreatment[] }>(`/api/chemical-tracker/treatments`);
    return (data.results || []).map(normalizeTreatment);
  },

  async createTreatment(payload: Omit<TreatmentItem, 'id' | 'chemical_name'> & { chemical: string }): Promise<TreatmentItem> {
    const created = await fetchApi<BackendTreatment>(`/api/chemical-tracker/treatments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTreatment(created);
  },

  async updateTreatment(id: string, payload: Partial<Omit<TreatmentItem, 'id' | 'chemical_name'>> & { chemical?: string }): Promise<TreatmentItem> {
    const updated = await fetchApi<BackendTreatment>(`/api/chemical-tracker/treatments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeTreatment(updated);
  },

  async deleteTreatment(id: string): Promise<void> {
    await fetchApi<void>(`/api/chemical-tracker/treatments/${id}`, {
      method: 'DELETE',
    });
  },

  async getTreatmentProgress(): Promise<TreatmentProgressItem[]> {
    const data = await fetchApi<{ results?: BackendTreatmentProgress[] }>(`/api/chemical-tracker/progress`);
    return (data.results || []).map(normalizeTreatmentProgress);
  },

  async createTreatmentProgress(payload: Omit<TreatmentProgressItem, 'id'>): Promise<TreatmentProgressItem> {
    const created = await fetchApi<BackendTreatmentProgress>(`/api/chemical-tracker/progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTreatmentProgress(created);
  },

  async updateTreatmentProgress(id: string, payload: Partial<Omit<TreatmentProgressItem, 'id'>>): Promise<TreatmentProgressItem> {
    const updated = await fetchApi<BackendTreatmentProgress>(`/api/chemical-tracker/progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeTreatmentProgress(updated);
  },

  async deleteTreatmentProgress(id: string): Promise<void> {
    await fetchApi<void>(`/api/chemical-tracker/progress/${id}`, {
      method: 'DELETE',
    });
  },

  async getFinalResults(): Promise<FinalResultItem[]> {
    const data = await fetchApi<{ results?: BackendFinalResult[] }>(`/api/chemical-tracker/final-results`);
    return (data.results || []).map(normalizeFinalResult);
  },

  async createFinalResult(payload: Omit<FinalResultItem, 'id'>): Promise<FinalResultItem> {
    const created = await fetchApi<BackendFinalResult>(`/api/chemical-tracker/final-results`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeFinalResult(created);
  },

  async updateFinalResult(id: string, payload: Partial<Omit<FinalResultItem, 'id'>> & { treatment?: string }): Promise<FinalResultItem> {
    const updated = await fetchApi<BackendFinalResult>(`/api/chemical-tracker/final-results/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeFinalResult(updated);
  },

  async deleteFinalResult(id: string): Promise<void> {
    await fetchApi<void>(`/api/chemical-tracker/final-results/${id}`, {
      method: 'DELETE',
    });
  },

  async getWeatherCurrent(
    city: string,
    country: string
  ): Promise<WeatherData> {
    const params = new URLSearchParams({ city, country });
    const data = await fetchApi<BackendWeatherResponse>(
      `/api/weather/current?${params.toString()}`
    );

    return normalizeWeather(data);
  },

  // Expense CRUD Operations
  async getExpenses(filters?: LogbookQueryFilters): Promise<{ results: ExpenseItem[]; count: number }> {
    const params = new URLSearchParams();
    appendFilters(params, filters);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/logbook/expenses?${queryString}`
      : '/api/logbook/expenses';

    const data = await fetchApi<{ results?: BackendExpense[]; count?: number }>(endpoint);

    return {
      results: (data.results || []).map(normalizeExpense),
      count: data.count ?? (data.results || []).length,
    };
  },

  async getExpense(id: string): Promise<ExpenseItem> {
    const data = await fetchApi<BackendExpense>(`/api/logbook/expenses/${id}`);
    return normalizeExpense(data);
  },

  async createExpense(data: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    const payload = {
      item: data.item,
      amount_spent: data.amount,
      quantity: data.quantity,
      category: data.category || null,
      date: data.date,
    };

    const created = await fetchApi<BackendExpense>('/api/logbook/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeExpense(created);
  },

  async updateExpense(
    id: string,
    data: Partial<Omit<ExpenseItem, 'id'>>
  ): Promise<ExpenseItem> {
    const payload: Record<string, unknown> = {};
    if (data.item !== undefined) payload.item = data.item;
    if (data.amount !== undefined) payload.amount_spent = data.amount;
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.category !== undefined) payload.category = data.category || null;
    if (data.date !== undefined) payload.date = data.date;

    const updated = await fetchApi<BackendExpense>(`/api/logbook/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return normalizeExpense(updated);
  },

  async deleteExpense(id: string): Promise<void> {
    await fetchApi<void>(`/api/logbook/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Sales CRUD Operations
  async getSales(filters?: LogbookQueryFilters): Promise<{ results: SalesItem[]; count: number }> {
    const params = new URLSearchParams();
    appendFilters(params, filters);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/logbook/sales?${queryString}`
      : '/api/logbook/sales';

    const data = await fetchApi<{ results?: BackendSale[]; count?: number }>(endpoint);

    return {
      results: (data.results || []).map(normalizeSale),
      count: data.count ?? (data.results || []).length,
    };
  },

  async getSale(id: string): Promise<SalesItem> {
    const data = await fetchApi<BackendSale>(`/api/logbook/sales/${id}`);
    return normalizeSale(data);
  },

  async createSale(data: Omit<SalesItem, 'id'>): Promise<SalesItem> {
    const payload = {
      product: data.item,
      amount_earned: data.amount,
      quantity: data.quantity,
      category: data.category || null,
      date: data.date,
    };

    const created = await fetchApi<BackendSale>('/api/logbook/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeSale(created);
  },

  async updateSale(
    id: string,
    data: Partial<Omit<SalesItem, 'id'>>
  ): Promise<SalesItem> {
    const payload: Record<string, unknown> = {};
    if (data.item !== undefined) payload.product = data.item;
    if (data.amount !== undefined) payload.amount_earned = data.amount;
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.category !== undefined) payload.category = data.category || null;
    if (data.date !== undefined) payload.date = data.date;

    const updated = await fetchApi<BackendSale>(`/api/logbook/sales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return normalizeSale(updated);
  },

  async deleteSale(id: string): Promise<void> {
    await fetchApi<void>(`/api/logbook/sales/${id}`, {
      method: 'DELETE',
    });
  },

  async login(username: string, password: string): Promise<AuthProfile> {
    await ensureCsrfCookie();

    const data = await fetchApi<{ user: AuthProfile['user'] }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const profile = await this.getProfile();
    return {
      user: data.user,
      profile: profile.profile,
    };
  },

  async logout(): Promise<void> {
    await fetchApi<{ detail: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getProfile(): Promise<AuthProfile> {
    return fetchApi<AuthProfile>('/api/auth/profile');
  },

  async updateProfile(payload: Partial<AuthProfile['profile']> & { email?: string }): Promise<AuthProfile> {
    return fetchApi<AuthProfile>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
