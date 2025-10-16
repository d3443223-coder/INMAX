interface StatValue {
  value: number;
  change: number;
}

export interface DashboardStats {
  totalCampaigns: StatValue;
  activeCampaigns: StatValue;
  totalSpend: StatValue;
  monthlySpend: StatValue;
  totalViews: StatValue;
  totalClicks: StatValue;
  conversions: StatValue;
  totalInteractions: StatValue;
  roi: StatValue;
  averageCTR: StatValue;
  averageConversionRate: StatValue;
  recentViews: StatValue;
  recentClicks: StatValue;
  recentConversions: StatValue;
  averageCPC: StatValue;
}