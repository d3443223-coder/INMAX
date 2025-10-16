import { Campaign, CampaignCreate, CampaignUpdate, CampaignStats, CampaignFilters } from '../types/campaign';
import api from './api';

export const campaignService = {
  async getCampaigns(filters?: CampaignFilters): Promise<{ campaigns: Campaign[]; total: number }> {
    const response = await api.get('/campaigns', { params: filters });
    return response.data;
  },

  async getCampaign(id: string): Promise<Campaign> {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(data: any): Promise<Campaign> {
    const response = await api.post('/campaigns/', data);
    return response.data;
  },

  async updateCampaign(id: string, data: CampaignUpdate): Promise<Campaign> {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },

  async getCampaignStats(id: string): Promise<CampaignStats> {
    const response = await api.get(`/campaigns/${id}/stats`);
    return response.data;
  },

  async getDashboardStats(): Promise<{
    total_campaigns: number;
    active_campaigns: number;
    total_views: number;
    total_clicks: number;
    total_conversions: number;
    total_spent: number;
  }> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
