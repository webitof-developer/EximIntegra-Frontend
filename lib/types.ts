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
  badge?: "SOON" | "BETA" | "NEW" | "LIVE";
  disabled?: boolean;
}
