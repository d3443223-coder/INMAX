export interface DashboardStats {
  totalCampaigns: { value: number; change: number };
  activeCampaigns: { value: number; change: number };
  totalViews: { value: number; change: number };
  totalClicks: { value: number; change: number };
  conversions: { value: number; change: number };
  totalSpend: { value: number; change: number };
  monthlySpend: { value: number; change: number };
  recentViews: { value: number; change: number };
  recentClicks: { value: number; change: number };
  recentConversions: { value: number; change: number };
  averageCTR: { value: number; change: number };
  averageConversionRate: { value: number; change: number };
  totalInteractions: { value: number; change: number };
  roi: { value: number; change: number };
  averageCPC: { value: number; change: number };
}