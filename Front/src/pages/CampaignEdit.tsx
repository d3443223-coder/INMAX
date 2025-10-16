import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Campaign, CampaignCreate, CampaignUpdate } from '../types/campaign';
import { campaignService } from '../services/campaignService';
import CreateCampaign from './CreateCampaign';

const CampaignEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CampaignUpdate>();
    return (
      <CreateCampaign
        initialData={campaign as CampaignCreate}
        campaignId={id}
        onSave={() => navigate(`/campaigns/${id}`)}
      />
    );
};

export default CampaignEdit;
