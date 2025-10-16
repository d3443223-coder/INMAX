export type ReportType = 
  | 'expense-by-campaign'
  | 'expense-by-location'
  | 'expense-by-product'
  | 'expense-evolution'
  | 'campaign-info';

export interface ReportData {
  campaignName: string;
  expense: number;
  location?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  metrics?: {
    views: number;
    clicks: number;
    conversions: number;
  };
}