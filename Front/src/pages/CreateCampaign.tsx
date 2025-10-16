import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { CampaignCreate, GeoLocation } from '../types/campaign';
import { CampaignRequestData, Base64MediaFile } from '../types/media';
import { campaignService } from '../services/campaignService';
import MapSelector from '../components/Common/MapSelector';
import FileUpload from '../components/Common/FileUpload';
import { useTranslation } from 'react-i18next';
import './CreateCampaign.css';

interface CreateCampaignProps {
  initialData?: Partial<CampaignCreate>;
  campaignId?: string;
  onSave?: () => void;
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({ initialData, campaignId, onSave }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [uploadedFiles, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleLocationSelect = (location: { coordinates: [number, number]; radius: number } | null) => {
    if (location) {
      setSelectedLocation({
        type: 'circle',
        coordinates: location.coordinates,
        radius: location.radius,
        address: 'Ubicación seleccionada'
      });
    } else {
      setSelectedLocation(null);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CampaignCreate>();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.target_locations && initialData.target_locations.length > 0) {
        setSelectedLocation(initialData.target_locations[0]);
      }
    }
  }, [initialData, reset]);

  // Convierte archivos a base64
  const filesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const onSubmit = async (formData: CampaignCreate) => {
    try {
      setLoading(true);

      // Formatear fechas
      const formatDateTime = (date: string, endOfDay: boolean = false): string => {
        if (!date) return '';
        if (date.includes('T')) return date;
        return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}`;
      };

      // Validar presupuesto
      const budgetValue = Number(formData.budget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        alert('El presupuesto debe ser mayor a 0.');
        setLoading(false);
        return;
      }

      // Preparar datos de la campaña según MediaRequestData
      let targetLocations: any[] = [];


// Helper to get city name from coordinates
const getCityFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.address.city || data.address.town || data.address.village || data.address.state || 'Sin ciudad';
  } catch {
    return 'Sin ciudad';
  }
};
      let validLocation = null;
      if (selectedLocation) {
        const [lng, lat] = selectedLocation.coordinates;
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          validLocation = selectedLocation;
        } else {
          alert('Las coordenadas seleccionadas no son válidas.\nLongitud debe estar entre -180 y 180.\nLatitud entre -90 y 90.');
          setLoading(false);
          return;
        }
      } else if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          const { latitude, longitude } = position.coords;
          if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
            validLocation = {
              type: 'point',
              coordinates: [longitude, latitude],
              address: 'Ubicación automática del usuario'
            };
          } else {
            alert('La ubicación automática tiene coordenadas inválidas.');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('No se pudo obtener la ubicación del usuario:', error);
        }
      }
      if (validLocation) {
        // Obtener ciudad y guardar en address
        if (validLocation && validLocation.coordinates) {
          const [lng, lat] = validLocation.coordinates;
          validLocation.address = await getCityFromCoords(lat, lng);
        }
        targetLocations = [validLocation];
      }

      // Guardar campaña usando la función localStorage
      const mediaFilesBase64 = await filesToBase64(uploadedFiles);
      if (campaignId) {
        // Editar campaña existente
        // @ts-ignore
        const { updateCampaign } = require('../services/localStorage');
        updateCampaign(campaignId, {
          ...formData,
          budget: budgetValue,
          target_locations: targetLocations,
          media_files: mediaFilesBase64,
        });
        if (onSave) onSave();
        navigate(`/campaigns/${campaignId}`);
      } else {
        // Crear nueva campaña
        // @ts-ignore
        const { addCampaign } = require('../services/localStorage');
        addCampaign({
          name: formData.name,
          description: formData.description || '',
          budget: budgetValue,
          channel: formData.channel || 'default',
          start_date: formatDateTime(formData.start_date),
          end_date: formatDateTime(formData.end_date, true),
          target_locations: targetLocations,
          media_files: mediaFilesBase64,
          product: formData.product || '',
          priority: formData.priority || 'medium',
          status: 'active',
        });
        navigate('/campaigns');
      }
    } catch (error) {
      console.error('Error creando campaña local:', error);
      alert('Error al crear la campaña local. Por favor, verifica los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  const channels = [
    { value: 'social_media', label: 'Redes Sociales' },
    { value: 'display', label: 'Display' },
    { value: 'search', label: 'Búsqueda' },
    { value: 'video', label: 'Video' },
    { value: 'mobile', label: 'Móvil' },
    { value: 'email', label: 'Email' },
  ];

  const priorities = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ];

  return (
    <div className="create-campaign">
      <div className="create-campaign-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/campaigns')}
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <div className="header-content">
          <h1>{t('createCampaign.newCampaign')}</h1>
          <p>{t('createCampaign.createAdCampaign')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="campaign-form">
        <div className="form-sections">
          <div className="form-section">
            <h3>{t('createCampaign.basicInfo')}</h3>
            
            <div className="form-group">
              <label htmlFor="name">{t('createCampaign.campaignName')} *</label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
                className={errors.name ? 'error' : ''}
                placeholder={t('createCampaign.campaignNamePlaceholder')}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="product">{t('createCampaign.product')} *</label>
              <input
                type="text"
                id="product"
                {...register('product', { required: 'El producto es requerido' })}
                className={errors.product ? 'error' : ''}
                placeholder={t('createCampaign.productPlaceholder')}
              />
              {errors.product && (
                <span className="error-message">{errors.product.message}</span>
              )}

              <label htmlFor="description">{t('createCampaign.description')}</label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder={t('createCampaign.descriptionPlaceholder')}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="channel">{t('createCampaign.channel')} *</label>
                <select
                  id="channel"
                  {...register('channel', { required: 'El canal es requerido' })}
                  className={errors.channel ? 'error' : ''}
                >
                  <option value="">{t('createCampaign.selectChannel')}</option>
                  {channels.map((channel) => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
                    </option>
                  ))}
                </select>
                {errors.channel && (
                  <span className="error-message">{errors.channel.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="priority">{t('createCampaign.priority')}</label>
                <select
                  id="priority"
                  {...register('priority')}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>{t('createCampaign.budgetAndDates')}</h3>
            
            <div className="form-group">
              <label htmlFor="budget">{t('createCampaign.budget')} *</label>
              <div className="input-with-symbol">
                <span className="symbol">$</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  id="budget"
                  {...register('budget', { 
                    required: 'El presupuesto es requerido',
                    min: { value: 1, message: 'El presupuesto debe ser mayor a 0' },
                    validate: value => (typeof value === 'string' ? /^\d+$/.test(value) : value > 0) || 'Solo números positivos'
                  })}
                  className={errors.budget ? 'error' : ''}
                  placeholder={t('createCampaign.budgetPlaceholder')}
                  style={{ paddingLeft: 50 }}
                />
              </div>
              {errors.budget && (
                <span className="error-message">{errors.budget.message}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">{t('createCampaign.startDate')} *</label>
                <input
                  type="date"
                  id="start_date"
                  {...register('start_date', { required: 'La fecha de inicio es requerida' })}
                  className={errors.start_date ? 'error' : ''}
                />
                {errors.start_date && (
                  <span className="error-message">{errors.start_date.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="end_date">{t('createCampaign.endDate')} *</label>
                <input
                  type="date"
                  id="end_date"
                  {...register('end_date', { required: 'La fecha de fin es requerida' })}
                  className={errors.end_date ? 'error' : ''}
                />
                {errors.end_date && (
                  <span className="error-message">{errors.end_date.message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>{t('createCampaign.location')}</h3>
            <div className="form-group">
              <label>{t('createCampaign.selectTargetArea')} *</label>
              <MapSelector
                onChange={handleLocationSelect}
                value={selectedLocation ? {
                  coordinates: selectedLocation.coordinates,
                  radius: selectedLocation.radius || 25
                } : null}
              />
              {!selectedLocation && (
                <span className="info-message">{t('createCampaign.useCurrentLocation')}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>{t('createCampaign.mediaFiles')}</h3>
            <div className="form-group">
              <label>{t('createCampaign.uploadImagesOrVideos')}</label>
              <FileUpload
                onFilesSelected={(files, previews) => {
                  setFiles(files);
                  setFilePreviews(previews);
                }}
                accept="image/*,video/*"
                multiple={true}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="preview-btn"
            onClick={() => {/* TODO: Implement preview */}}
          >
            <Eye size={20} />
            {t('createCampaign.preview')}
          </button>
          
          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? t('createCampaign.creating') : t('createCampaign.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
