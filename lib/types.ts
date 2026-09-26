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
