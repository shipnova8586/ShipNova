import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Custom icons
const glowingIcon = L.divIcon({
  className: 'glowing-dot-marker',
  html: '<div class="glowing-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const defaultPointIcon = L.divIcon({
  className: 'point-marker',
  html: '<div class="origin-marker"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const LiveMap = () => {
  // Mock coordinates for demo
  const origin = [21.2049, 72.8398]; // Surat (Varachha)
  const dest = [19.0760, 72.8777]; // Mumbai
  
  // Calculate center
  const center = [
    (origin[0] + dest[0]) / 2,
    (origin[1] + dest[1]) / 2
  ];

  const [currentPos, setCurrentPos] = useState(origin);

  useEffect(() => {
    let startTime = Date.now();
    const duration = 60000; // 60 seconds for full trip (slower, more realistic)
    
    let animationId;
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % duration;
      const progress = elapsed / duration; // 0 to 1
      
      const lat = origin[0] + (dest[0] - origin[0]) * progress;
      const lng = origin[1] + (dest[1] - origin[1]) * progress;
      
      setCurrentPos([lat, lng]);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [dest, origin]);

  return (
    <MapContainer center={center} zoom={7} zoomControl={false} scrollWheelZoom={false}>
      {/* CartoDB Dark Matter Base Map */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      
      {/* Route Line */}
      <Polyline positions={[origin, dest]} color="#1e293b" weight={4} dashArray="5, 10" />
      <Polyline positions={[origin, currentPos]} color="#06b6d4" weight={4} />

      {/* Markers */}
      <Marker position={origin} icon={defaultPointIcon} />
      <Marker position={dest} icon={defaultPointIcon} />
      <Marker position={currentPos} icon={glowingIcon} />
    </MapContainer>
  );
};

export default LiveMap;
