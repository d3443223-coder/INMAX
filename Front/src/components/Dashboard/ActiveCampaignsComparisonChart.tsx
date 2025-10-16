
import React from 'react';
import { Campaign } from '../../types/campaign';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

interface ActiveCampaignsComparisonChartProps {
  campaigns: Campaign[];
}


function getMonthYear(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

const ActiveCampaignsComparisonChart: React.FC<ActiveCampaignsComparisonChartProps> = ({ campaigns }) => {
  const { t } = useTranslation();
  // Agrupar campañas activas por mes

  const now = new Date();
  const currentMonth = getMonthYear(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = getMonthYear(lastMonthDate);

  // Campaña activa si su rango de fechas incluye el mes
  function isActiveInMonth(c: Campaign, month: string) {
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    const [year, m] = month.split('-').map(Number);
    const monthStart = new Date(year, m - 1, 1);
    const monthEnd = new Date(year, m, 0, 23, 59, 59);
    // Considerar campañas activas si su rango de fechas incluye el mes, sin filtrar por status
    return end >= monthStart && start <= monthEnd;
  }

  const countByMonth = (month: string) =>
    campaigns.filter(c => isActiveInMonth(c, month)).length;

  const data = [
    { month: t('dashboard.lastMonth', 'Mes pasado'), value: countByMonth(lastMonth) },
    { month: t('dashboard.currentMonth', 'Mes actual'), value: countByMonth(currentMonth) }
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3>{t('dashboard.activeCampaignsComparisonChart', 'Campañas Activas: Mes actual vs Mes pasado')}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: t('dashboard.monthAxis', 'Mes'), position: 'insideBottom', offset: -5 }} />
          <YAxis allowDecimals={false} label={{ value: t('dashboard.activeCampaignsAxis', 'Campañas activas'), angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => `${t('dashboard.activeCampaignsAxis', 'Campañas activas')}: ${value}`} labelFormatter={(label) => `${t('dashboard.monthAxis', 'Mes')}: ${label}`} />
          <Legend formatter={() => t('dashboard.activeCampaignsAxis', 'Campañas activas')} />
          <Line type="monotone" dataKey="value" stroke="#10b981" name={t('dashboard.activeCampaignsAxis', 'Campañas activas')} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActiveCampaignsComparisonChart;
