export type ItemType = "NEWS" | "OPPORTUNITY";

export type Category = 
  | "GEOPOLITICS"
  | "ECONOMY_FINANCE"
  | "TECH_ENGINEERING"
  | "ADULTING_MENTAL_MODELS"
  | "OPPORTUNITIES";

export type ImportanceTier = 
  | "CRITICAL_DEEP_DIVE"
  | "STANDARD_BRIEF"
  | "QUICK_SIGNAL";

export type SourceType = 
  | "MAJOR_OUTLET"
  | "NICHE_CREDIBLE"
  | "SOCIAL_SIGNAL"
  | "OPPORTUNITY_PORTAL";

export interface JargonTerm {
  term: string;
  definition: string;
}

export interface SourceVerification {
  primary_source_name: string;
  source_type: SourceType;
  credibility_note: string;
  original_url: string;
  discussion_or_secondary_url?: string;
}

export interface OpportunityMeta {
  is_opportunity: boolean;
  deadline?: string;
  funding_or_reward?: string;
  eligibility?: string;
}

export interface SidePanel {
  jargon_buster: JargonTerm[];
  source_verification: SourceVerification;
}

export interface IntelItem {
  id: string;
  topic_slug: string;
  type: ItemType;
  category: Category;
  importance_tier: ImportanceTier;
  headline: string;
  summary_points: string[];
  why_it_matters: string;
  deep_dive_analysis?: string | null;
  opportunity_meta?: OpportunityMeta;
  side_panel: SidePanel;
  saved_at?: string;
}

export interface EditionStats {
  total_items: number;
  news_count: number;
  opportunities_count: number;
  sources_scanned: number;
}

export interface IntelEdition {
  edition_id: string;
  generated_at_utc: string;
  generated_at_bst: string;
  edition_shift: string;
  executive_pulse: string;
  stats: EditionStats;
  items: IntelItem[];
}

export interface EditionIndexEntry {
  edition_id: string;
  shift: string;
  date: string;
  label: string;
  filename: string;
}

export interface EditionIndexManifest {
  latest_edition_id: string;
  editions: EditionIndexEntry[];
}
