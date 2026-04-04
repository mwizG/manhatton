// API Response Types
export interface LogbookSummary {
  total_spent: number;
  total_earned: number;
  profit_loss: number;
  currency: string;
  expenses: ExpenseItem[];
  sales: SalesItem[];
  expense_trends: TrendSeries[];
  sales_trends: TrendSeries[];
}

export interface ExpenseItem {
  id: string;
  item: string;
  category: string;
  quantity: number;
  amount: number;
  date: string;
  unit?: string;
}

export interface SalesItem {
  id: string;
  item: string;
  category: string;
  quantity: number;
  amount: number;
  date: string;
  unit?: string;
}

export interface TrendSeries {
  name: string;
  value: number;
  percentage?: number;
}

export interface ChemicalRecommendation {
  id: string;
  chemical: string;
  plant: string;
  illness: string;
  success_rate: number;
  minor_result_rate: number;
  count: number;
}

export interface WeatherData {
  location: {
    city: string;
    country: string;
  };
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    wind_speed: number;
  };
  timestamp: string;
}

// Component Props
export interface FilterState {
  filter_by?: string;
  filter_value?: string;
  filter_value_min?: number;
  filter_value_max?: number;
  filter_range_start?: string;
  filter_range_end?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

export interface AuthProfile {
  user: {
    username: string;
    email: string;
  };
  profile: {
    firstname: string;
    lastname: string;
    bio: string;
    location: string;
    birth_date: string;
  };
}

export interface ChemicalItem {
  id: string;
  name: string;
  active_ingredient: string;
  usage_instructions: string;
  associated_products?: string | null;
}

export interface TrackerRecommendation {
  id: string;
  chemical: string;
  chemical_name: string;
  recommended_date: string;
  reason: string;
  result: string;
  plant: string;
  illness: string;
  success: boolean;
  minor_result: boolean;
}

export interface TreatmentItem {
  id: string;
  chemical: string;
  chemical_name: string;
  plant: string;
  illness: string;
  treatment_date: string;
  is_preventative: boolean;
  duration_days: number;
  times_per_week: number;
}

export interface TreatmentProgressItem {
  id: string;
  treatment: string;
  date: string;
  details: string;
}

export interface FinalResultItem {
  id: string;
  treatment: string;
  date: string;
  observation: string;
  success: boolean;
  minor_result: boolean;
  failed: boolean;
}
