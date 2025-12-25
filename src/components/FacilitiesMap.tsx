'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Facility } from '@/types';

// Fix for default marker icons in webpack/next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Hospital marker - blue
const hospitalIcon = L.divIcon({
  className: 'custom-marker hospital-marker',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <span style="color: white; font-size: 12px; font-weight: bold;">H</span>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

// PHU marker - green
const phuIcon = L.divIcon({
  className: 'custom-marker phu-marker',
  html: `<div style="
    width: 22px;
    height: 22px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11]
});

L.Marker.prototype.options.icon = defaultIcon;

interface FacilitiesMapProps {
  facilities: Facility[];
  isLoading?: boolean;
}

export default function FacilitiesMap({ facilities, isLoading }: FacilitiesMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Sierra Leone center coordinates
    const sierraLeoneCenter: [number, number] = [8.4606, -11.7799];
    
    mapRef.current = L.map(containerRef.current).setView(sierraLeoneCenter, 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Create marker cluster group with custom options
    clusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let sizeClass = 40;
        
        if (count >= 100) {
          size = 'large';
          sizeClass = 60;
        } else if (count >= 20) {
          size = 'medium';
          sizeClass = 50;
        }
        
        return L.divIcon({
          html: `<div style="
            width: ${sizeClass}px;
            height: ${sizeClass}px;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: ${count >= 100 ? '14px' : '12px'};
          ">${count}</div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(sizeClass, sizeClass),
        });
      }
    });
    
    mapRef.current.addLayer(clusterGroupRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when facilities change
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    // Clear existing markers
    clusterGroupRef.current.clearLayers();

    // Add markers for facilities with valid coordinates
    const validFacilities = facilities.filter(
      f => f.latitude && f.longitude && 
           !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude))
    );

    const markers: L.Marker[] = [];

    validFacilities.forEach(facility => {
      const lat = Number(facility.latitude);
      const lng = Number(facility.longitude);
      
      const facilityType = facility.type || facility.facilityType || '';
      const isHospital = facilityType.includes('HOSPITAL');
      const icon = isHospital ? hospitalIcon : phuIcon;

      const marker = L.marker([lat, lng], { icon });
      
      // Create popup content
      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1f2937;">${facility.name}</h3>
          <div style="font-size: 12px; color: #6b7280;">
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 3px 8px; background: ${isHospital ? '#3b82f6' : '#22c55e'}; color: white; border-radius: 6px; font-size: 11px; font-weight: 500;">
                ${facilityType || 'Unknown'}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span style="color: #374151;">${facility.district?.name || 'Unknown District'}</span>
            </div>
            ${facility.address ? `
            <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span style="color: #374151;">${facility.address}</span>
            </div>` : ''}
            ${facility.phone ? `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span style="color: #374151;">${facility.phone}</span>
            </div>` : ''}
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af;">
              Code: ${facility.facilityCode} | ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </div>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, { maxWidth: 300 });
      marker.bindTooltip(facility.name, { 
        permanent: false, 
        direction: 'top',
        offset: [0, -10],
        className: 'facility-tooltip'
      });
      
      markers.push(marker);
    });

    // Add all markers to cluster group
    clusterGroupRef.current.addLayers(markers);

    // Fit bounds if we have facilities
    if (validFacilities.length > 0) {
      const bounds = L.latLngBounds(
        validFacilities.map(f => [Number(f.latitude), Number(f.longitude)] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [facilities]);

  if (isLoading) {
    return (
      <div style={{ 
        height: 600, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  const facilitiesWithCoords = facilities.filter(f => f.latitude && f.longitude).length;

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .facility-tooltip {
          background: rgba(17, 24, 39, 0.9);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .facility-tooltip::before {
          border-top-color: rgba(17, 24, 39, 0.9);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          box-shadow: none;
        }
      `}</style>
      <div 
        ref={containerRef}
        style={{ 
          height: 600, 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }} 
      />
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        background: 'rgba(255,255,255,0.98)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--text-sm)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        zIndex: 1000,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)', color: '#1f2937' }}>Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ 
              width: 22, 
              height: 22, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }} />
            <span style={{ color: '#374151' }}>PHU / Clinic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ 
              width: 26, 
              height: 26, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>H</div>
            <span style={{ color: '#374151' }}>Hospital</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ 
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: '600'
            }}>5+</div>
            <span style={{ color: '#374151' }}>Cluster</span>
          </div>
        </div>
        <div style={{ 
          marginTop: 'var(--space-3)', 
          paddingTop: 'var(--space-3)', 
          borderTop: '1px solid #e5e7eb',
          color: '#6b7280', 
          fontSize: 'var(--text-xs)' 
        }}>
          {facilitiesWithCoords.toLocaleString()} of {facilities.length.toLocaleString()} facilities shown
        </div>
      </div>
    </div>
  );
}
