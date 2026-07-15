export type TargetType = 'all' | 'percentage' | 'users' | 'stores';
export type Environment = 'all' | 'production' | 'staging' | 'development';

export interface FeatureFlag {
  id: number;
  name: string;
  key: string; // unique identifier (e.g., 'new-checkout-flow')
  description: string;
  enabled: boolean;
  target_type: TargetType;
  target_value?: string | number; // percentage (number) or comma-separated IDs (string)
  environment: Environment;
  usage_count: number; // how many users/requests affected
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagFilters {
  search?: string;
  status?: 'enabled' | 'disabled';
  environment?: Environment;
  target_type?: TargetType;
  page?: number;
  per_page?: number;
}
