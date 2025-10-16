import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngTuple, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Campaign } from '../../types/campaign';

// Configurar el ícono por defecto para los marcadores
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface CampaignMapProps {
  campaigns: Campaign[];
}

const CampaignMap: React.FC<CampaignMapProps> = ({ campaigns }) => {
  const defaultCenter: LatLngTuple = [20, 0];

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={defaultCenter} zoom={2} style={{ height: '100%', width: '100%' }} worldCopyJump={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {campaigns.map((campaign) =>
          campaign.target_locations?.map((loc, idx) => {
            if (loc.coordinates && loc.coordinates.length === 2) {
              const position: LatLngTuple = [loc.coordinates[1], loc.coordinates[0]]; // Lat, Lng
              const radiusInMeters = (loc.radius || 0) * 1000;

              return (
                <React.Fragment key={`${campaign.id}-${idx}`}>
                  <Marker position={position} icon={defaultIcon}>
                    <Popup>
                      <strong>{campaign.name}</strong>
                      {loc.address && <div>{loc.address}</div>}
                      <div>Radio: {loc.radius} km</div>
                    </Popup>
                  </Marker>
                  {radiusInMeters > 0 && (
                    <Circle
                      center={position}
                      radius={radiusInMeters}
                      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          })
        )}
      </MapContainer>
    </div>
  );
};

export default CampaignMap;
