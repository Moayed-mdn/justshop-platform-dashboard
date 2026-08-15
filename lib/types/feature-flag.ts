export type TargetType = 'all' | 'percentage' | 'users' | 'stores';
export type Environment = 'all' | 'production' | 'staging' | 'development';

export interface FeatureFlag {
  name: string; // unique identifier (e.g., 'observability.events.enabled')
  value: boolean; // current runtime value
  has_override: boolean; // whether there's a runtime override
  updated_at: string | null; // last override timestamp
  metadata: {
    default: boolean | string | number;
    owner?: string;
    business_owner?: string;
    description?: string;
    blast_radius?: string;
    rollback_effect?: string;
    expiry_milestone?: string;
    category?: string;
    introduced_wave?: string;
    kill_switch?: boolean;
  };
}

export interface FeatureFlagFilters {
  search?: string;
  status?: 'enabled' | 'disabled';
  environment?: Environment;
  target_type?: TargetType;
  page?: number;
  per_page?: number;
}
