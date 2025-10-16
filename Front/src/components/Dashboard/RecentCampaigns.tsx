import React, { useState, useEffect } from 'react';
import { Campaign } from '../../types/campaign';
import { campaignService } from '../../services/campaignService';
import { Eye, MousePointer, TrendingUp, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './RecentCampaigns.css';

const RecentCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Usar campañas locales
        // @ts-ignore
        const { getCampaigns } = require('../../services/localStorage');
        const campaignsLocal = getCampaigns();
        setCampaigns(campaignsLocal.slice(0, 5));
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'finished': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t('campaigns.status.active', 'Activa');
      case 'paused': return t('campaigns.status.paused', 'Pausada');
      case 'finished': return t('campaigns.status.finished', 'Finalizada');
      case 'cancelled': return t('campaigns.status.cancelled', 'Cancelada');
      case 'draft': return t('campaigns.status.draft', 'Borrador');
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="recent-campaigns">
        <h3>{t('dashboard.recentCampaigns', 'Campañas Recientes')}</h3>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('common.loadingCampaigns', 'Cargando campañas...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-campaigns">
      <div className="recent-campaigns-header">
        <h3>{t('dashboard.recentCampaigns', 'Campañas Recientes')}</h3>
        <button className="view-all-btn">{t('dashboard.viewAll', 'Ver todas')}</button>
      </div>

      <div className="campaigns-list">
        {campaigns.length === 0 ? (
          <div className="empty-state">
            <p>{t('campaigns.empty.title', 'No hay campañas disponibles')}</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-item">
              <div className="campaign-info">
                <h4 className="campaign-name">{campaign.name}</h4>
                <p className="campaign-description">{campaign.description}</p>
                <div className="campaign-metrics">
                  <div className="metric">
                    <Eye size={16} />
                    <span>{campaign.stats?.views || campaign.views_count || 0}</span>
                  </div>
                  <div className="metric">
                    <MousePointer size={16} />
                    <span>{campaign.stats?.clicks || campaign.clicks_count || 0}</span>
                  </div>
                  <div className="metric">
                    <TrendingUp size={16} />
                    <span>{campaign.stats?.conversions || campaign.conversions_count || 0}</span>
                  </div>
                </div>
              </div>
              <div className="campaign-actions">
                <div 
                  className="campaign-status"
                  style={{ backgroundColor: getStatusColor(campaign.status) + '20', color: getStatusColor(campaign.status) }}
                >
                  {getStatusText(campaign.status)}
                </div>
                <button className="campaign-menu-btn">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentCampaigns;
