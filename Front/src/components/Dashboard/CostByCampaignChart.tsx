
import React from 'react';
import { Campaign } from '../../types/campaign';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';

interface CostByCampaignChartProps {
  campaigns: Campaign[];
}

const CostByCampaignChart: React.FC<CostByCampaignChartProps> = ({ campaigns }) => {
  const { t } = useTranslation();
  const data = campaigns.map(c => ({
    name: c.name,
    budget: Number(c.budget || 0)
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3>{t('dashboard.costByCampaignChart', 'Costos por Campaña')}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(name) => name} label={{ value: t('dashboard.campaignAxis', 'Campaña'), position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: t('dashboard.costAxis', 'Costo'), angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => `${t('dashboard.costAxis', 'Costo')}: $${value}`} labelFormatter={(label) => `${t('dashboard.campaignAxis', 'Campaña')}: ${label}`} />
          <Bar dataKey="budget" fill="#8884d8" name={t('dashboard.costAxis', 'Costo')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostByCampaignChart;
