/**
 * EximIntegra Core Frontend & Backend Integration Types
 */

export type ProvenanceType = "LIVE" | "ILLUSTRATIVE" | "BYOK" | "UNAVAILABLE";

export interface ProvenanceMetadata {
  type: ProvenanceType;
  source: string;
  effectiveDate?: string;
  confidenceScore?: number;
  notes?: string;
}

export interface MaterialContext {
  hsCode?: string;
  hsDescription?: string;
  materialName?: string;
  countryOfOrigin?: string;
  destinationCountry?: string;
  assessableValue?: number;
  currency?: string;
  unit?: string;
  quantity?: number;
  lastUpdated?: string;
}

export interface NavItemConfig {
  id: string;
  title: string;
  href: string;
  glyph?: string;
  iconName?: string;
  section: "CORE" | "ANALYTICS" | "INTELLIGENCE" | "SYSTEM";
  badge?: "SOON" | "BETA" | "NEW" | "LIVE" | "DEV";
  disabled?: boolean;
}

/* Auth Types */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  company: string;
  role: "IMPORTER" | "EXPORTER" | "CUSTOMS_BROKER" | "TRADE_ADVISOR" | "ADMIN";
  tier: "ENTERPRISE" | "PROFESSIONAL" | "STARTER";
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  name: string;
  company: string;
  role?: UserProfile["role"];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

/* Classification Types */
export interface ClassificationRequest {
  description: string;
  material_type?: string;
  country_of_origin?: string;
  destination_country?: string;
  additional_specs?: Record<string, any>;
}

export interface IndicativeDuty {
  bcd: number;
  sws: number;
  igst: number;
  aidc?: number;
  effective_rate?: number;
}

export interface ClassificationCandidate {
  hs_code: string;
  description: string;
  confidence: number;
  gir_applied: string;
  gir_rationale: string;
  chapter?: string;
  chapter_title?: string;
  provenance: ProvenanceMetadata;
  duty_indicative?: IndicativeDuty;
  policy_condition?: "Free" | "Restricted" | "Prohibited" | "STE";
  export_incentives?: string[];
}

export interface ClassificationResponse {
  query: string;
  primary: ClassificationCandidate;
  alternates: ClassificationCandidate[];
  timestamp: string;
}

export interface BulkClassificationItem {
  id: string;
  input_description: string;
  matched_hs_code: string;
  matched_description: string;
  confidence: number;
  gir_rule: string;
  indicative_bcd: number;
  provenance_type: ProvenanceType;
}

export interface BulkJobStatus {
  job_id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  total_rows: number;
  processed_rows: number;
  progress_percent: number;
  created_at: string;
  completed_at?: string;
  download_url?: string;
  results?: BulkClassificationItem[];
}
