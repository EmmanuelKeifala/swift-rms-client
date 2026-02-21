'use client';

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

interface ActiveReferral {
  id: string;
  code: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  fromFacility: { name: string; latitude?: number; longitude?: number };
  toFacility: { name: string; latitude?: number; longitude?: number };
}

interface Ambulance {
  id: string;
  ambulanceId: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

interface Facility {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  readinessScore?: number;
  type?: string;
}

interface NationalReferralMapProps {
  referrals: ActiveReferral[];
  ambulances: Ambulance[];
  facilities: Facility[];
  height?: number;
  selectedDistrict?: string;
  selectedPriority?: string;
  showReferrals?: boolean;
  showAmbulances?: boolean;
  showHighReadiness?: boolean;
  showMediumReadiness?: boolean;
  showLowReadiness?: boolean;
}

const PRIORITY_COLORS = {
  'CRITICAL': '#DC2626',
  'HIGH': '#F59E0B',
  'MEDIUM': '#3B82F6',
  'LOW': '#10B981',
};

const getReadinessColor = (score: number): string => {
  if (score >= 8) return '#10B981';
  if (score >= 5) return '#F59E0B';
  return '#DC2626';
};

function FitBounds({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  
  useEffect(() => {
    const validFacilities = facilities.filter(f => f.latitude && f.longitude);
    if (validFacilities.length > 0) {
      const bounds = validFacilities.map(f => [f.latitude!, f.longitude!] as [number, number]);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [facilities, map]);

  return null;
}

export default function NationalReferralMap({
  referrals,
  ambulances,
  facilities,
  height = 400,
  selectedDistrict,
  selectedPriority,
  showReferrals = true,
  showAmbulances = true,
  showHighReadiness = true,
  showMediumReadiness = true,
  showLowReadiness = true,
}: NationalReferralMapProps) {
  // Default center: Sierra Leone
  const defaultCenter: [number, number] = [8.4606, -11.7799];

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    if (!showReferrals) return [];
    return referrals.filter(r => {
      if (selectedPriority && r.priority !== selectedPriority) return false;
      return true;
    });
  }, [referrals, selectedPriority, showReferrals]);

  // Filter ambulances
  const filteredAmbulances = useMemo(() => {
    if (!showAmbulances) return [];
    return ambulances;
  }, [ambulances, showAmbulances]);

  // Filter facilities by readiness
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const score = f.readinessScore || 0;
      if (score >= 8 && !showHighReadiness) return false;
      if (score >= 5 && score < 8 && !showMediumReadiness) return false;
      if (score < 5 && !showLowReadiness) return false;
      return true;
    });
  }, [facilities, showHighReadiness, showMediumReadiness, showLowReadiness]);

  // Prepare transfer lines
  const transferLines = useMemo(() => {
    return filteredReferrals
      .filter(r => 
        r.fromFacility?.latitude && r.fromFacility?.longitude &&
        r.toFacility?.latitude && r.toFacility?.longitude
      )
      .map(r => ({
        id: r.id,
        priority: r.priority,
        positions: [
          [r.fromFacility.latitude!, r.fromFacility.longitude!] as [number, number],
          [r.toFacility.latitude!, r.toFacility.longitude!] as [number, number],
        ],
      }));
  }, [filteredReferrals]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={8}
      style={{ 
        height, 
        width: '100%', 
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-overlay)'
      }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {filteredFacilities.length > 0 && <FitBounds facilities={filteredFacilities} />}

      {/* Facilities - squares colored by readiness */}
      {filteredFacilities.map((facility) => {
        if (!facility.latitude || !facility.longitude) return null;
        const score = facility.readinessScore || 0;
        const color = getReadinessColor(score);
        
        return (
          <CircleMarker
            key={`facility-${facility.id}`}
            center={[facility.latitude, facility.longitude]}
            radius={8}
            fillColor={color}
            color="#fff"
            weight={2}
            opacity={0.9}
            fillOpacity={0.7}
          >
            <Popup>
              <div style={{ minWidth: 140, fontSize: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{facility.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ color: '#666' }}>Readiness:</span>
                  <span style={{ fontWeight: 600, color }}>{score.toFixed(1)}/10</span>
                </div>
                {facility.type && (
                  <div style={{ fontSize: '11px', color: '#888', marginTop: 4 }}>{facility.type}</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Transfer lines */}
      {transferLines.map((line) => (
        <Polyline
          key={`line-${line.id}`}
          positions={line.positions}
          color={PRIORITY_COLORS[line.priority]}
          weight={2}
          opacity={0.6}
          dashArray="5, 5"
        />
      ))}

      {/* Active Referrals - destination points */}
      {filteredReferrals.map((ref) => {
        if (!ref.toFacility?.latitude || !ref.toFacility?.longitude) return null;
        
        return (
          <CircleMarker
            key={`ref-${ref.id}`}
            center={[ref.toFacility.latitude, ref.toFacility.longitude]}
            radius={12}
            fillColor={PRIORITY_COLORS[ref.priority]}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.9}
          >
            <Popup>
              <div style={{ minWidth: 160, fontSize: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{ref.code}</div>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '2px 8px', 
                  borderRadius: 4, 
                  background: PRIORITY_COLORS[ref.priority],
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 600,
                  marginBottom: 6
                }}>
                  {ref.priority}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  From: {ref.fromFacility?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  To: {ref.toFacility?.name || 'Unknown'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Ambulances */}
      {filteredAmbulances.map((amb) => {
        if (!amb.latitude || !amb.longitude) return null;
        const isActive = amb.status === 'ON_MISSION' || amb.status === 'EN_ROUTE';
        
        return (
          <CircleMarker
            key={`amb-${amb.id}`}
            center={[amb.latitude, amb.longitude]}
            radius={10}
            fillColor={isActive ? '#8B5CF6' : '#6B7280'}
            color="#fff"
            weight={3}
            opacity={1}
            fillOpacity={0.9}
          >
            <Popup>
              <div style={{ minWidth: 120, fontSize: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{amb.ambulanceId}</div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: isActive ? '#8B5CF6' : '#6B7280',
                  color: '#fff',
                  fontSize: '10px'
                }}>
                  {amb.status.replace('_', ' ')}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
