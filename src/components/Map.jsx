import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, GeoJSON, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ onZoomChange, coordinates }) => {
  const map = useMap();
  
  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, 16, { duration: 1.2 });
    }
  }, [coordinates, map]);

  return null;
};

const createCustomIcon = (status) => {
  const color = 
    status === 'CRITICAL' ? '#ef4444' : 
    status === 'MODERATE' ? '#eab308' : '#22c55e';
  
  const className = status === 'CRITICAL' ? 'custom-marker animate-marker-pulse' : 'custom-marker';

  return L.divIcon({
    className: '',
    html: `<div class="${className}" style="width: 14px; height: 14px; background-color: ${color}; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

// --- NEW: Custom Cluster Icon Function ---
const createClusterCustomIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers();
  let worstStatus = 'NORMAL';
  
  // Analyze markers in cluster to find the most critical status
  for (const marker of markers) {
    const status = marker.options.status;
    if (status === 'CRITICAL') {
      worstStatus = 'CRITICAL';
      break; // Found the worst, no need to check others
    }
    if (status === 'MODERATE') worstStatus = 'MODERATE';
  }

  const color = 
    worstStatus === 'CRITICAL' ? '#ef4444' : 
    worstStatus === 'MODERATE' ? '#eab308' : '#22c55e';
  
  const pulseClass = worstStatus === 'CRITICAL' ? 'animate-pulse' : '';

  return L.divIcon({
    html: `
      <div class="flex items-center justify-center rounded-full border-2 border-white shadow-lg ${pulseClass}" 
           style="background-color: ${color}; width: 32px; height: 32px; color: white; font-weight: bold; font-size: 12px;">
        ${cluster.getChildCount()}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(32, 32),
  });
};

const riverStyle = (feature) => ({
  color: feature.properties.waterway === 'river' ? '#3b82f6' : '#60a5fa',
  weight: feature.properties.waterway === 'river' ? 3 : 1.5,
  opacity: 0.5,
});

const Map = ({ levees, selectedLevee, onSelectLevee }) => {
  const [fiumiData, setFiumiData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(11);
  const [isRiversLoading, setIsRiversLoading] = useState(true);
  
  useEffect(() => {
    fetch('/demo-leveesat/data/fiumi.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setFiumiData(data);
      })
      .catch(err => console.error("Error loading river data:", err))
      .finally(() => {
        setIsRiversLoading(false);
      });
  }, []);

  const filteredRivers = useMemo(() => {
    if (!fiumiData) return null;
    if (zoomLevel < 11) {
      return { ...fiumiData, features: fiumiData.features.filter(f => f.properties.waterway === 'river') };
    }
    return fiumiData;
  }, [fiumiData, zoomLevel]);

  const visibleLevees = useMemo(() => {
    if (zoomLevel < 10) return levees.filter(l => l.status === 'CRITICAL');
    if (zoomLevel < 12) return levees.filter(l => l.status === 'CRITICAL' || l.status === 'MODERATE');
    return levees;
  }, [levees, zoomLevel]);

  const center = levees.length > 0 ? levees[0].coordinates : [44.8381, 11.6198];

  return (
    <div className="w-full h-full relative bg-levee-dark">
      {isRiversLoading && (
        <div className="absolute inset-0 z-[1001] bg-black/40 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Processing Monitoring Network...</span>
          </div>
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={11} 
        scrollWheelZoom={true} 
        className="z-0"
        preferCanvas={true}
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController onZoomChange={setZoomLevel} coordinates={selectedLevee?.coordinates} />

        {filteredRivers && (
          <GeoJSON 
            key={`rivers-layer-${zoomLevel < 11 ? 'simplified' : 'full'}`} 
            data={filteredRivers} 
            style={riverStyle} 
          />
        )}

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={40}
          iconCreateFunction={createClusterCustomIcon} // CRITICAL: Use the new priority logic
        >
          {visibleLevees.map((levee) => (
            <Marker
              key={levee.id}
              position={levee.coordinates}
              status={levee.status} // Store status in options for cluster access
              icon={createCustomIcon(levee.status)}
              eventHandlers={{
                click: () => onSelectLevee(levee),
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <span className="w-2 h-2 bg-red-500 rounded-full border border-black"></span>
              <span className="w-2 h-2 bg-yellow-500 rounded-full border border-black"></span>
              <span className="w-2 h-2 bg-green-500 rounded-full border border-black"></span>
            </div>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Status-Aware Clustering</span>
          </div>
          <div className="w-[1px] h-3 bg-white/20"></div>
          <span className="text-[10px] text-blue-400 font-medium italic">
            Priority: {zoomLevel < 10 ? 'Critical' : zoomLevel < 12 ? 'Alerts' : 'Full Network'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Map;
