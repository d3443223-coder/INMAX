// Tipos para la solicitud de campaña con archivos base64
export interface Base64MediaFile {
  filename: string;
  content_type: string;
  base64_content: string;
  size?: number;
}

export interface CampaignRequestData {
  name: string;
  description?: string;
  budget: number;
  channel: string;
  start_date: string;
  end_date: string;
  media_files: Base64MediaFile[];
  target_locations?: any[];
}