import { Campaign } from '../types/campaign';
import { DashboardStats } from '../types/dashboard';
import { campaignService } from './campaignService';

export const statsService = {
  async getOverallStats(): Promise<DashboardStats> {
    const { campaigns } = await campaignService.getCampaigns();
    const prevStats = await this.getPreviousStats();
    
    // Calcular estadísticas actuales
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalViews = {
      value: campaigns.reduce((sum, c) => sum + (c.views_count || 0), 0),
      change: 0
    };
    const totalClicks = {
      value: campaigns.reduce((sum, c) => sum + (c.clicks_count || 0), 0),
      change: 0
    };
    const conversions = {
      value: campaigns.reduce((sum, c) => sum + (c.conversions_count || 0), 0),
      change: 0
    };
    const totalSpend = {
      value: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
      change: 0
    };
    const monthlySpend = {
      value: activeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
      change: 0
    };

    // Calcular interacciones totales
    const totalInteractions = {
      value: totalViews.value + totalClicks.value + conversions.value,
      change: 0
    };

    // Calcular ROI
    const roi = {
      value: totalSpend.value > 0 ? ((conversions.value * 100) - totalSpend.value) / totalSpend.value * 100 : 0,
      change: 0
    };

    // Calcular CPC promedio
    const averageCPC = {
      value: totalClicks.value > 0 ? totalSpend.value / totalClicks.value : 0,
      change: 0
    };

    return {
      totalCampaigns: {
        value: campaigns.length,
        change: 0
      },
      activeCampaigns: {
        value: activeCampaigns.length,
        change: 0
      },
      totalViews,
      totalClicks,
      conversions,
      totalSpend,
      monthlySpend,
      recentViews: { ...totalViews },
      recentClicks: { ...totalClicks },
      recentConversions: { ...conversions },
      averageCTR: {
        value: totalViews.value ? (totalClicks.value / totalViews.value) * 100 : 0,
        change: 0
      },
      averageConversionRate: {
        value: totalClicks.value ? (conversions.value / totalClicks.value) * 100 : 0,
        change: 0
      },
      totalInteractions,
      roi,
      averageCPC
    };
  },

  async getPreviousStats(): Promise<DashboardStats> {
    // Por ahora retornamos un objeto con valores iniciales
    // En una implementación real, esto debería obtener los datos históricos
    return {
      totalCampaigns: { value: 0, change: 0 },
      activeCampaigns: { value: 0, change: 0 },
      totalViews: { value: 0, change: 0 },
      totalClicks: { value: 0, change: 0 },
      conversions: { value: 0, change: 0 },
      totalSpend: { value: 0, change: 0 },
      monthlySpend: { value: 0, change: 0 },
      recentViews: { value: 0, change: 0 },
      recentClicks: { value: 0, change: 0 },
      recentConversions: { value: 0, change: 0 },
      averageCTR: { value: 0, change: 0 },
      averageConversionRate: { value: 0, change: 0 },
      totalInteractions: { value: 0, change: 0 },
      roi: { value: 0, change: 0 },
      averageCPC: { value: 0, change: 0 }
    };
  },

  async getCampaignPerformance(days: number = 30) {
    const { campaigns } = await campaignService.getCampaigns();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    return {
      dates,
      views: dates.map(() => Math.floor(Math.random() * 1000)),
      clicks: dates.map(() => Math.floor(Math.random() * 100)),
      conversions: dates.map(() => Math.floor(Math.random() * 10))
    };
  },

  async getCampaignComparison() {
    const { campaigns } = await campaignService.getCampaigns();
    const sortedCampaigns = campaigns
      .sort((a, b) => (b.budget || 0) - (a.budget || 0))
      .slice(0, 5);

    return {
      labels: sortedCampaigns.map(c => c.name),
      data: sortedCampaigns.map(c => c.budget || 0)
    };
  },

  async getLocationStats() {
    const { campaigns } = await campaignService.getCampaigns();
    const locations = campaigns
      .filter(c => c.target_locations && c.target_locations.length > 0)
      .flatMap(c => c.target_locations.map(location => ({
        lat: location.coordinates[0],
        lng: location.coordinates[1],
        weight: c.budget || 0
      })));

    return { locations };
  }
};