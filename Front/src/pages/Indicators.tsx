import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { statsService } from '../services/statsService';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import '../styles/Indicators.css';

function Indicators() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    monthlySpend: 0,
    totalInteractions: 0,
    roi: 0,
    totalClicks: 0,
    averageCPC: 0,
  });

  const updateStats = async () => {
    try {
      const statsData = await statsService.getOverallStats();
      
      setStats({
        activeCampaigns: statsData.activeCampaigns.value,
        monthlySpend: statsData.monthlySpend.value,
        totalInteractions: statsData.totalInteractions.value,
        roi: statsData.roi.value,
        totalClicks: statsData.totalClicks.value,
        averageCPC: statsData.averageCPC.value
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const indicators = [
    {
      title: t('indicators.activeCampaigns'),
      value: formatNumber(stats.activeCampaigns)
    },
    {
      title: t('indicators.monthlySpend'),
      value: formatCurrency(stats.monthlySpend)
    },
    {
      title: t('indicators.totalInteractions'),
      value: formatNumber(stats.totalInteractions)
    },
    {
      title: t('indicators.roi'),
      value: formatPercentage(stats.roi)
    },
    {
      title: t('indicators.totalClicks'),
      value: formatNumber(stats.totalClicks)
    },
    {
      title: t('indicators.averageCPC'),
      value: formatCurrency(stats.averageCPC)
    }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">{t('indicators.title')}</h1>
      <div className="indicators-grid">
        {indicators.map((indicator, idx) => (
          <div className="indicator-card" key={idx}>
            <div className="indicator-title">{indicator.title}</div>
            <div className="indicator-value">{indicator.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Indicators;