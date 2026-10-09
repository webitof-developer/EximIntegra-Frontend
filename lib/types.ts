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
  dataset_version?: string;
  dataset_version_id?: string;
}

export interface MaterialContext {
  hsCode?: string;
  hsDescription?: string;
  materialName?: string;
  countryOfOrigin?: string;
  destinationCountry?: string;
  tradeAgreement?: string;
  assessableValue?: number;
  currency?: string;
  unit?: string;
  quantity?: number;
  dutyCalculationId?: string;
  landedCostCalculationId?: string;
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
  tier?: UserProfile["tier"];
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

/* Duty Calculator Types */
export interface DutyCalculationRequest {
  hs_code: string;
  assessable_value: number;
  currency: string;
  exchange_rate?: number;
  country_of_origin: string;
  destination_country?: string;
  trade_agreement?: string;
  quantity?: number;
  unit?: string;
  freight_amount?: number;
  insurance_amount?: number;
}

export interface DutyFieldDetail {
  name: string;
  statutory_rate: number;
  concessional_rate?: number;
  rate_applied: number;
  amount_inr: number;
  calculation_basis?: string;
  status?: string;
  provenance: ProvenanceMetadata;
}

export interface DutyCalculationResponse {
  calculation_id: string;
  timestamp: string;
  hs_code: string;
  hs_description: string;
  country_of_origin: string;
  destination_country: string;
  trade_agreement: string;
  exchange_rate: number;
  cif_value_inr: number;
  assessable_value_inr: number;
  assessable_value_usd: number;
  quantity?: number;
  unit?: string;
  duties: {
    bcd: DutyFieldDetail;
    sws: DutyFieldDetail;
    aidc: DutyFieldDetail;
    anti_dumping: DutyFieldDetail;
    igst: DutyFieldDetail;
  };
  total_customs_duty_inr: number;
  total_tax_inclusive_duty_inr: number;
  total_landed_customs_inr: number;
  effective_duty_percentage: number;
  total_effective_tax_percentage: number;
  liability_disclaimer: string;
}

/* Landed Cost Engine Types */
export interface LandedCostRequest {
  duty_calculation_id: string;
  hs_code?: string;
  quantity: number;
  unit: string;
  port_of_discharge: string;
  thc_cfs_handling_inr?: number;
  inland_transit_inr?: number;
  cha_agency_inr?: number;
  finance_insurance_inr?: number;
  // Composition & recovery parameters (§2.3)
  contained_metal?: string;
  assay_purity_percent?: number;
  smelter_recovery_yield_percent?: number;
}

export interface MetalRecoveryAnalysis {
  contained_metal: string;
  assay_purity_percent: number;
  smelter_recovery_yield_percent: number;
  effective_recovered_quantity_mt: number;
  cost_per_contained_metal_mt_inr: number;
  cost_per_contained_metal_mt_usd: number;
  yield_multiplier: number;
  assumption_provenance: ProvenanceMetadata;
}

export interface CostWaterfallItem {
  id: string;
  label: string;
  amount_inr: number;
  amount_usd: number;
  percent_of_total: number;
  category: "CIF" | "DUTY" | "PORT" | "LOGISTICS" | "FINANCE" | "TAX";
  is_recoverable_itc?: boolean;
}

export interface LandedCostResponse {
  landed_cost_id: string;
  duty_calculation_id: string;
  timestamp: string;
  hs_code: string;
  hs_description: string;
  origin_country: string;
  destination_port: string;
  exchange_rate: number;
  batch_quantity: number;
  batch_unit: string;
  
  // Total costs
  gross_landed_cost_inr: number;
  gross_landed_cost_usd: number;
  net_landed_cost_inr: number;
  net_landed_cost_usd: number;
  
  // Unit costs
  landed_cost_per_mt_inr: number;
  landed_cost_per_mt_usd: number;
  landed_cost_per_kg_inr: number;
  landed_cost_per_kg_usd: number;

  // Waterfall breakdown
  cost_waterfall: CostWaterfallItem[];

  // Metal yield analysis (per §2.3)
  metal_recovery?: MetalRecoveryAnalysis;
}

/* Eligibility & Scheme Types */
export interface SchemeDetail {
  id: string;
  name: string;
  category: "FTA" | "EXPORT_PROMOTION" | "DUTY_DEFERRAL" | "REMISSION";
  status: "ELIGIBLE" | "CONDITIONALLY_ELIGIBLE" | "RESTRICTED" | "NOT_ELIGIBLE";
  headline_benefit: string;
  preferential_duty_rate?: number;
  standard_mfn_rate: number;
  duty_saving_percentage: number;
  rules_of_origin: string;
  documentation_required: string[];
  effective_date: string;
  provenance: ProvenanceMetadata;
}

export interface RegulatoryMeasure {
  id: string;
  agency: string;
  title: string;
  mandatory: boolean;
  status: "COMPLIANCE_REQUIRED" | "EXEMPT" | "RECOMMENDED";
  description: string;
  provenance: ProvenanceMetadata;
}

export interface EligibilityResponse {
  hs_code: string;
  hs_description: string;
  effective_as_of_date: string;
  prominent_disclaimer: string;
  statutory_policy_status: "Free" | "Restricted" | "Prohibited" | "STE";
  schemes: SchemeDetail[];
  regulatory_measures: RegulatoryMeasure[];
  last_updated: string;
}

/* Country Comparison Types */
export interface CountryComparisonRequest {
  hs_code: string;
  assessable_value: number;
  currency: string;
  quantity: number;
  unit: string;
  countries: string[]; // e.g. ["US", "AE", "AU", "VN"]
}

export interface CountryComparisonItem {
  country_code: string;
  country_name: string;
  flag: string;
  trade_agreement: string;
  is_preferential_fta: boolean;
  cif_inr: number;
  bcd_rate: number;
  bcd_inr: number;
  sws_inr: number;
  add_inr: number;
  igst_inr: number;
  total_customs_duty_inr: number;
  port_logistics_inr: number;
  net_landed_cost_inr: number;
  net_landed_cost_usd: number;
  landed_cost_per_mt_inr: number;
  landed_cost_per_mt_usd: number;
  contained_metal_cost_mt_inr?: number;
  savings_vs_mfn_inr: number;
  savings_percentage: number;
  is_recommended_arbitrage: boolean;
  provenance: ProvenanceMetadata;
}

export interface CountryComparisonResponse {
  hs_code: string;
  hs_description: string;
  quantity: number;
  unit: string;
  timestamp: string;
  best_arbitrage_country: string;
  max_savings_inr: number;
  comparisons: CountryComparisonItem[];
}

/* Akshara AI Types (§6) */
export interface AksharaToolCall {
  id: string;
  tool_name: string;
  endpoint: string;
  summary: string;
  parameters: Record<string, any>;
  execution_time_ms: number;
  provenance: ProvenanceMetadata;
}

export interface ContextUpdateAction {
  label: string;
  payload: Partial<MaterialContext>;
}

export interface AksharaMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tool_calls_made?: AksharaToolCall[];
  unresolved_subclaims?: string[];
  context_action?: ContextUpdateAction;
  is_unresolvable_warning?: boolean;
}

export interface AksharaRequest {
  message: string;
  conversation_id?: string;
  active_context?: Partial<MaterialContext>;
}

export interface AksharaResponse {
  message_id: string;
  conversation_id: string;
  role: "assistant";
  content: string;
  timestamp: string;
  tool_calls_made: AksharaToolCall[];
  unresolved_subclaims: string[];
  context_action?: ContextUpdateAction;
  is_unresolvable_warning?: boolean;
}

/* Phase 7: History & Data Provenance Types (§7) */
export interface DatasetVersion {
  id: string;
  name: string;
  authority: string;
  reference_code: string;
  version: string;
  effective_date: string;
  last_sync: string;
  status: "ACTIVE" | "DEGRADED" | "UPDATING";
  provenance: ProvenanceMetadata;
  coverage_summary: string;
  record_count?: number;
  official_portal_url?: string;
}

export interface CalculationHistoryRecord {
  id: string;
  type: "DUTY" | "LANDED_COST";
  timestamp: string;
  hs_code: string;
  hs_description: string;
  commodity_name: string;
  country_of_origin: string;
  destination: string;
  trade_agreement?: string;
  quantity?: number;
  unit?: string;
  total_outlay_inr: number;
  total_outlay_usd: number;
  key_metric_label: string;
  key_metric_value: string;
  provenance_type: ProvenanceType;
  tags: string[];
  duty_details?: DutyCalculationResponse;
  landed_cost_details?: LandedCostResponse;
}

export interface HistoryResponse {
  records: CalculationHistoryRecord[];
  total_count: number;
  active_user: string;
}

