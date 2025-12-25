'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2 } from 'lucide-react';

interface SingleFacilityMapProps {
  latitude: number;
  longitude: number;
  name: string;
  type?: string;
  code?: string;
}

// Fix default marker icon issue in Leaflet with Next.js
const createFacilityIcon = (type?: string) => {
  const isHospital = type?.toLowerCase().includes('hospital');
  const color = isHospital ? '#3b82f6' : '#22c55e';
  
  return L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
          <path d="M10 6h4"/>
          <path d="M10 10h4"/>
          <path d="M10 14h4"/>
          <path d="M10 18h4"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export default function SingleFacilityMap({ latitude, longitude, name, type, code }: SingleFacilityMapProps) {
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker 
          position={[latitude, longitude]}
          icon={createFacilityIcon(type)}
        >
          <Popup>
            <div style={{ minWidth: 150 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
              {code && <div style={{ fontSize: 12, color: '#64748b' }}>{code}</div>}
              {type && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{type}</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
