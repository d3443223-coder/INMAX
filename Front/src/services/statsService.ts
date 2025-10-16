import { Campaign } from '../types/campaign';
import { DashboardStats } from '../types/dashboard';
import { campaignService } from './campaignService';

export const statsService = {
  // Función para asegurar que un valor sea numérico
  ensureNumber(value: any): number {
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof value === 'number' ? value : 0;
  },

  // Función para calcular el cambio porcentual con verificación de valores previos
  calculateChange(current: number, previous: { value: number }): number {
    return previous ? ((current - previous.value) / previous.value) * 100 : 0;
  },

  // Obtener estadísticas anteriores (usando localStorage)
  getPreviousStats(): DashboardStats {
    try {
      const savedStats = localStorage.getItem('previous_stats');
      if (savedStats) {
        return JSON.parse(savedStats);
      }
    } catch (error) {
      console.error('Error reading previous stats:', error);
    }
    
    // Si no hay estadísticas previas, retornar valores por defecto
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

  // Función para calcular el cambio porcentual
  calculatePercentageChange(current: number, previous: number): number {
    return previous ? ((current - previous) / previous) * 100 : 0;
  },

  // Obtener estadísticas generales
  async getOverallStats(): Promise<DashboardStats> {
    // Usar campañas locales
    // @ts-ignore
    const { getCampaigns } = require('./localStorage');
  const campaigns: Campaign[] = getCampaigns();
  const prevStats = this.getPreviousStats();
  const activeCampaigns: Campaign[] = campaigns.filter((c: Campaign) => c.status === 'active');

  // Calcular métricas base
  const totalViews = campaigns.reduce((sum: number, c: Campaign) => sum + this.ensureNumber(c.views_count), 0);
  const totalClicks = campaigns.reduce((sum: number, c: Campaign) => sum + this.ensureNumber(c.clicks_count), 0);
  const totalConversions = campaigns.reduce((sum: number, c: Campaign) => sum + this.ensureNumber(c.conversions_count), 0);
  const totalSpend = campaigns.reduce((sum: number, c: Campaign) => sum + this.ensureNumber(c.budget), 0);
  const monthlySpendValue = activeCampaigns.reduce((sum: number, c: Campaign) => sum + this.ensureNumber(c.budget), 0);

    // Calcular métricas derivadas
    const totalInteractionsValue = totalViews + totalClicks + totalConversions;
    const roiValue = totalSpend > 0 ? ((totalConversions * 100) / totalSpend) - 1 : 0;
    const averageCPCValue = totalClicks > 0 ? totalSpend / totalClicks : 0;

    const stats: DashboardStats = {
      totalCampaigns: {
        value: campaigns.length,
        change: this.calculatePercentageChange(campaigns.length, prevStats.totalCampaigns.value)
      },
      activeCampaigns: {
        value: activeCampaigns.length,
        change: this.calculatePercentageChange(activeCampaigns.length, prevStats.activeCampaigns.value)
      },
      totalViews: {
        value: totalViews,
        change: this.calculatePercentageChange(totalViews, prevStats.totalViews.value)
      },
      totalClicks: {
        value: totalClicks,
        change: this.calculatePercentageChange(totalClicks, prevStats.totalClicks.value)
      },
      conversions: {
        value: totalConversions,
        change: this.calculatePercentageChange(totalConversions, prevStats.conversions.value)
      },
      totalSpend: {
        value: totalSpend,
        change: this.calculatePercentageChange(totalSpend, prevStats.totalSpend.value)
      },
      monthlySpend: {
        value: monthlySpendValue,
        change: this.calculatePercentageChange(monthlySpendValue, prevStats.monthlySpend.value)
      },
      recentViews: {
        value: totalViews,
        change: this.calculatePercentageChange(totalViews, prevStats.recentViews.value)
      },
      recentClicks: {
        value: totalClicks,
        change: this.calculatePercentageChange(totalClicks, prevStats.recentClicks.value)
      },
      recentConversions: {
        value: totalConversions,
        change: this.calculatePercentageChange(totalConversions, prevStats.recentConversions.value)
      },
      averageCTR: {
        value: totalViews ? (totalClicks / totalViews) * 100 : 0,
        change: this.calculatePercentageChange(
          totalViews ? (totalClicks / totalViews) * 100 : 0,
          prevStats.averageCTR.value
        )
      },
      averageConversionRate: {
        value: totalClicks ? (totalConversions / totalClicks) * 100 : 0,
        change: this.calculatePercentageChange(
          totalClicks ? (totalConversions / totalClicks) * 100 : 0,
          prevStats.averageConversionRate.value
        )
      },
      totalInteractions: {
        value: totalInteractionsValue,
        change: this.calculatePercentageChange(totalInteractionsValue, prevStats.totalInteractions.value)
      },
      roi: {
        value: roiValue,
        change: this.calculatePercentageChange(roiValue, prevStats.roi.value)
      },
      averageCPC: {
        value: averageCPCValue,
        change: this.calculatePercentageChange(averageCPCValue, prevStats.averageCPC.value)
      }
    };

    // Guardar estadísticas actuales para comparación futura
    localStorage.setItem('previous_stats', JSON.stringify(stats));

    return stats;
  }
};