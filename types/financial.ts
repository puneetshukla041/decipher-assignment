export interface SecFactUnit {
  form: string;
  fy: number;
  val: number;
  [key: string]: unknown;
}

export interface SecFactItem {
  units: Record<string, SecFactUnit[]>;
  [key: string]: unknown;
}

export interface SecFactsNamespace {
  [factName: string]: SecFactItem;
}

export interface SECCompanyFacts {
  entityName: string;
  cik: string;
  facts: Record<string, SecFactsNamespace>;
}

export interface FinancialContextType {
  data: SECCompanyFacts | null;
  loading: boolean;
  error: string | null;
  fetchCompanyData: (cik: string) => Promise<void>;
}
