import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { LatLng, LatLngTuple, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './MapSelector.css';

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

interface MapSelectorProps {
  onChange?: (location: { coordinates: [number, number]; radius: number } | null) => void;
  value?: { coordinates: [number, number]; radius: number } | null;
}

const MapEvents: React.FC<{ onPositionChange: (pos: LatLng) => void }> = ({ onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });
  return null;
};

const LocationMarker: React.FC<{ position: LatLng }> = ({ position }) => {
  return <Marker position={position} icon={defaultIcon} />;
};

const MapSelector: React.FC<MapSelectorProps> = ({ onChange, value }) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState<number>(1);
  const [internalValue, setInternalValue] = useState(value);
  const center: LatLngTuple = [20, 0];

  // Inicializar con el valor proporcionado
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(internalValue)) {
      setPosition(new LatLng(value.coordinates[1], value.coordinates[0]));
      setRadius(value.radius);
      setInternalValue(value);
    }
  }, [value]);

  const handlePositionChange = (newPosition: LatLng) => {
    setPosition(newPosition);
    if (onChange) {
      const newValue = {
        coordinates: [newPosition.lng, newPosition.lat] as [number, number],
        radius: radius,
      };
      setInternalValue(newValue);
      onChange(newValue);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    if (newRadius === radius) return; // Evitar actualizaciones innecesarias
    setRadius(newRadius);
    if (onChange && position) {
      const newValue = {
        coordinates: [position.lng, position.lat] as [number, number],
        radius: newRadius,
      };
      setInternalValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <div className="map-selector-container">
      <div className="radius-selector">
        <label htmlFor="radius-slider">Radio de alcance: <b>{radius.toFixed(1)} km</b></label>
        <input
          id="radius-slider"
          type="range"
          min={1}
          max={5}
          step={0.1}
          value={radius}
          onChange={e => handleRadiusChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="map-container">
        <MapContainer
          center={center}
          zoom={2}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents onPositionChange={handlePositionChange} />
          {position && (
            <>
              <Marker position={position} icon={defaultIcon} />
              <Circle
                center={position}
                radius={radius * 1000}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
            </>
          )}
        </MapContainer>
      </div>
      
      <p className="map-helper">Haz clic en el mapa para seleccionar la ubicación de tu campaña</p>
    </div>
  );
};

export default MapSelector;