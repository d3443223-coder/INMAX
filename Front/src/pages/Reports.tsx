import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { campaignService } from '../services/campaignService';
import { formatCurrency } from '../utils/formatters';
import '../styles/Reports.css';
import { ReportType, ReportData } from '../types/reports';

interface TableData {
  headers: string[];
  rows: string[][];
}

const REPORT_TYPES = {
  'expense-by-campaign': 'Informe de gastos por campaña',
  'expense-by-location': 'Informe de inversión por ubicación',
  'expense-by-product': 'Informe de inversión por producto',
  'expense-evolution': 'Informe de evolución de gastos',
  'campaign-info': 'Informe detallado de campañas'
} as const;

const reportGenerators = {
  'expense-by-campaign': async () => {
          // Usar campañas locales
          // @ts-ignore
          const { getCampaigns } = require('../services/localStorage');
          const campaigns = getCampaigns();
    return {
      headers: ['Campaña', 'Gasto', 'Estado', 'Fecha Inicio', 'Fecha Fin'],
  rows: campaigns.map((campaign: any) => [
        campaign.name,
        formatCurrency(campaign.budget || 0),
        campaign.status,
        new Date(campaign.start_date).toLocaleDateString(),
        new Date(campaign.end_date).toLocaleDateString()
      ])
    };
  },
  'expense-by-location': async () => {
          // Usar campañas locales
          // @ts-ignore
          const { getCampaigns } = require('../services/localStorage');
          const campaigns = getCampaigns();
    // Agrupar gastos por ubicación
  const locationStats = campaigns.reduce((acc: {[key: string]: {total: number, count: number}}, campaign: any) => {
      if (campaign.target_locations && campaign.target_locations.length > 0) {
        // Agrupar por ciudad si address tiene ciudad, si no por address
        const address = campaign.target_locations[0].address || 'Sin ubicación';
        const cityMatch = address.match(/^[A-Za-zÁÉÍÓÚáéíóúüÜñÑ\s]+$/) ? address : 'Sin ciudad';
        const location = cityMatch !== 'Sin ciudad' ? cityMatch : address;
        if (!acc[location]) {
          acc[location] = { total: 0, count: 0 };
        }
        acc[location].total += Number(campaign.budget) || 0;
        acc[location].count += 1;
      }
      return acc;
    }, {});

    return {
      headers: ['Ubicación', 'Gasto Total', 'Cantidad de Campañas'],
      rows: Object.entries(locationStats).map(([location, stats]) => [
        location,
        formatCurrency(Number((stats as any).total)),
        (stats as any).count.toString()
      ])
    };
  },
  'expense-by-product': async () => {
          // Usar campañas locales
          // @ts-ignore
          const { getCampaigns } = require('../services/localStorage');
          const campaigns = getCampaigns();
    // Agrupar gastos por producto
  const productStats = campaigns.reduce((acc: {[key: string]: {total: number, count: number}}, campaign: any) => {
      const product = campaign.product || 'Sin producto';
      if (!acc[product]) {
        acc[product] = { total: 0, count: 0 };
      }
      acc[product].total += campaign.budget || 0;
      acc[product].count += 1;
      return acc;
    }, {});

    return {
      headers: ['Producto', 'Gasto Total', 'Cantidad de Campañas', 'ROI Estimado'],
      rows: Object.entries(productStats).map(([product, stats]) => [
        product,
        formatCurrency((stats as any).total),
        (stats as any).count.toString(),
        '0%' // ROI real pendiente de implementar
      ])
    };
  },
  'expense-evolution': async () => {
          // Usar campañas locales
          // @ts-ignore
          const { getCampaigns } = require('../services/localStorage');
          const campaigns = getCampaigns();
    // Agrupar gastos por mes
  const monthlyStats = campaigns.reduce((acc: {[key: string]: number}, campaign: any) => {
      const month = new Date(campaign.start_date).toLocaleString('es', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + (Number(campaign.budget) || 0);
      return acc;
    }, {});

    // Ordenar los meses cronológicamente
    const monthOrder = Object.keys(monthlyStats).sort((a, b) => {
      const [ma, ya] = a.split(' de ');
      const [mb, yb] = b.split(' de ');
      const dateA = new Date(`${ya}-${ma}-01`);
      const dateB = new Date(`${yb}-${mb}-01`);
      return dateA.getTime() - dateB.getTime();
    });
    return {
      headers: ['Mes', 'Gasto Total', 'Variación'],
      rows: monthOrder.map((month, index) => {
        const total = monthlyStats[month];
        const prevMonth = monthOrder[index - 1];
        const prevTotal = prevMonth ? monthlyStats[prevMonth] : total;
        const variation = prevTotal ? ((total - prevTotal) / prevTotal * 100) : 0;
        return [
          month,
          formatCurrency(Number(total)),
          `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`
        ];
      })
    };
  },
  'campaign-info': async () => {
          // Usar campañas locales
          // @ts-ignore
          const { getCampaigns } = require('../services/localStorage');
          const campaigns = getCampaigns();
    return {
      headers: ['Campaña', 'Estado', 'Presupuesto', 'Vistas', 'Clics', 'Conversiones', 'ROI'],
      rows: campaigns.map((campaign: import('../types/campaign').Campaign) => [
        campaign.name,
        campaign.status,
        formatCurrency(campaign.budget || 0),
        '1,234',
        '123',
        '12',
        '+8.5%'
      ])
    };
  }
};

function Reports() {
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState<keyof typeof REPORT_TYPES>('expense-by-campaign');
  const [tableData, setTableData] = useState<TableData>({ headers: [], rows: [] });
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const generateReport = async () => {
    try {
      const generator = reportGenerators[selectedReport];
      if (generator) {
        const data = await generator();
        setTableData(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  useEffect(() => {
    generateReport();
  }, [selectedReport]);

  return (
    <div className="page-container">
      <main className="content">
        <h1 className="page-title">{t('reports.title')}</h1>
        <div className="report-controls">
          <div className="filter-group">
            <label htmlFor="report-select">{t('reports.selectReport')}:</label>
            <select
              id="report-select"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as keyof typeof REPORT_TYPES)}
            >
              {Object.entries(REPORT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{t(`reports.types.${value}`)}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="start-date">{t('reports.startDate')}:</label>
            <input 
              type="date" 
              id="start-date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <button 
            className="generate-button"
            onClick={generateReport}
          >
            {t('reports.generate')}
          </button>
        </div>
        <div className="report-display">
          <h2>{t(`reports.types.${selectedReport}`)}</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {tableData.headers.map((header: string) => (
                    <th key={header}>{t(`reports.headers.${header}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row: string[], index: number) => (
                  <tr key={index}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Reports;
