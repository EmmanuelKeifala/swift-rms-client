'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

interface Facility {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  readinessScore?: number;
  bedAvailability?: number;
  lastUpdated?: string;
}

interface FacilityReadinessMapProps {
  facilities: Facility[];
  height?: number;
}

// Gets color based on readiness score
const getScoreColor = (score: number): string => {
  if (score >= 8) return '#10B981'; // Green - High
  if (score >= 5) return '#F59E0B'; // Yellow - Medium
  return '#DC2626'; // Red - Low
};

// Component to fit bounds
function FitBounds({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  
  useEffect(() => {
    const validFacilities = facilities.filter(f => f.latitude && f.longitude);
    if (validFacilities.length > 0) {
      const bounds = validFacilities.map(f => [f.latitude!, f.longitude!] as [number, number]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [facilities, map]);

  return null;
}

export default function FacilityReadinessMap({ facilities, height = 300 }: FacilityReadinessMapProps) {
  // Filter facilities with valid coordinates
  const validFacilities = facilities.filter(f => f.latitude && f.longitude);

  // Default center: Sierra Leone
  const defaultCenter: [number, number] = [8.4606, -11.7799];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={8}
      style={{ 
        height, 
        width: '100%', 
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-overlay)'
      }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {validFacilities.length > 0 && <FitBounds facilities={validFacilities} />}
      
      {validFacilities.map((facility) => {
        const score = facility.readinessScore || 0;
        const color = getScoreColor(score);
        
        return (
          <CircleMarker
            key={facility.id}
            center={[facility.latitude!, facility.longitude!]}
            radius={10}
            fillColor={color}
            color={color}
            weight={2}
            opacity={0.9}
            fillOpacity={0.6}
          >
            <Popup>
              <div style={{ minWidth: 160, fontSize: '13px' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{facility.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#666' }}>Readiness:</span>
                  <span style={{ fontWeight: 600, color }}>{score.toFixed(1)}/10</span>
                </div>
                {facility.bedAvailability !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Beds:</span>
                    <span style={{ fontWeight: 500 }}>{facility.bedAvailability} available</span>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
