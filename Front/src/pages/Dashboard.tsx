import React, { useState, useEffect } from 'react';
import CampaignMap from '../components/Dashboard/CampaignMap';
import { useAuth } from '../contexts/AuthContext';
import { Campaign } from '../types/campaign';
import { DashboardStats } from '../types/dashboard';
import { DashboardConfig } from '../services/localStorage';
import { statsService } from '../services/statsService';
import { getCampaigns, getDashboardConfig } from '../services/localStorage';
import { useTranslation } from 'react-i18next';
import { Megaphone, TrendingUp, Eye, MousePointer, Users, DollarSign, Settings } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PerformanceChart from '../components/Dashboard/PerformanceChart';
import CostByCampaignChart from '../components/Dashboard/CostByCampaignChart';
import ActiveCampaignsComparisonChart from '../components/Dashboard/ActiveCampaignsComparisonChart';
import DashboardConfigModal from '../components/Dashboard/DashboardConfigModal';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
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
  });
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(getDashboardConfig());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const updateStats = async () => {
    setLoading(true);
    try {
      const campaignsLocal = getCampaigns();
      setCampaigns(campaignsLocal);
      const stats = await statsService.getOverallStats();
      setStats(stats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <button 
          className="config-button"
          onClick={() => setShowConfigModal(true)}
          title={t('dashboard.configure')}
        >
          <Settings size={20} />
          {t('dashboard.configure')}
        </button>
      </div>

      <div className="stats-grid">
        {dashboardConfig.widgets.totalCampaigns && (
          <StatsCard
            title={t('dashboard.totalCampaigns')}
            value={formatNumber(stats.totalCampaigns.value)}
            icon={Megaphone}
            color="#667eea"
            change={formatPercentage(stats.totalCampaigns.change)}
          />
        )}
        {dashboardConfig.widgets.activeCampaigns && (
          <StatsCard
            title={t('dashboard.activeCampaigns')}
            value={formatNumber(stats.activeCampaigns.value)}
            icon={TrendingUp}
            color="#10b981"
            change={formatPercentage(stats.activeCampaigns.change)}
          />
        )}
        {dashboardConfig.widgets.totalViews && (
          <StatsCard
            title={t('dashboard.totalViews')}
            value={formatNumber(stats.totalViews.value)}
            icon={Eye}
            color="#3b82f6"
            change={formatPercentage(stats.totalViews.change)}
          />
        )}
        {dashboardConfig.widgets.totalClicks && (
          <StatsCard
            title={t('dashboard.totalClicks')}
            value={formatNumber(stats.totalClicks.value)}
            icon={MousePointer}
            color="#8b5cf6"
            change={formatPercentage(stats.totalClicks.change)}
          />
        )}
        {dashboardConfig.widgets.conversions && (
          <StatsCard
            title={t('dashboard.conversions')}
            value={formatNumber(stats.conversions.value)}
            icon={Users}
            color="#f59e0b"
            change={formatPercentage(stats.conversions.change)}
          />
        )}
        {dashboardConfig.widgets.totalSpend && (
          <StatsCard
            title={t('dashboard.totalSpend')}
            value={formatCurrency(stats.totalSpend.value)}
            icon={DollarSign}
            color="#ef4444"
            change={`${stats.totalSpend.change >= 0 ? '+' : ''}${stats.totalSpend.change}%`}
          />
        )}
      </div>

      <div className="dashboard-content">
        {dashboardConfig.widgets.campaignMap && (
          <div className="map-section">
            <CampaignMap campaigns={campaigns} />
          </div>
        )}
        {dashboardConfig.charts.performanceChart && (
          <div className="chart-section">
            <PerformanceChart />
          </div>
        )}
        {dashboardConfig.charts.costByCampaignChart && (
          <div className="chart-section">
            <CostByCampaignChart campaigns={campaigns} />
          </div>
        )}
        {dashboardConfig.charts.activeCampaignsComparisonChart && (
          <div className="chart-section">
            <ActiveCampaignsComparisonChart campaigns={campaigns} />
          </div>
        )}
        <div className="recent-section">
          <h3>{t('dashboard.recentCampaigns', 'Recent Campaigns')}</h3>
          <RecentCampaigns />
        </div>
      </div>

      {showConfigModal && (
        <DashboardConfigModal
          config={dashboardConfig}
          onSave={setDashboardConfig}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
