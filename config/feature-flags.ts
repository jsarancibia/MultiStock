export type FeatureFlag =
  | "reports_v1"
  | "exports_csv_v1"
  | "multi_business_switcher_v1"
  | "audit_visible_v1"
  | "cash_simple_v2"
  | "branches_v2"
  | "cafeteria_v2"
  | "plans_v3"
  | "invitations_v3";

export const defaultFeatureFlags: Record<FeatureFlag, boolean> = {
  reports_v1: true,
  exports_csv_v1: true,
  multi_business_switcher_v1: true,
  audit_visible_v1: true,
  cash_simple_v2: false,
  branches_v2: false,
  cafeteria_v2: false,
  plans_v3: false,
  invitations_v3: false,
};
