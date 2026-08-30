'use client';

import React, { useState, useRef } from 'react';

interface GeoLocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  timestamp: number;
}

export function CameraCapture({ onCapture }: { onCapture?: (file: File, geo: GeoLocationData) => void }) {
  const [geoData, setGeoData] = useState<GeoLocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestLocationAndCapture = () => {
    if (!navigator.geolocation) {
      setErrorMsg('La geolocalización no es compatible con tu navegador.');
      return;
    }

    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        });
        // Trigger file input after getting location
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      },
      (err) => {
        console.error('Geo error', err);
        setErrorMsg('Se requiere acceso a la ubicación para la captura.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && geoData && onCapture) {
      onCapture(file, geoData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#09090B] text-white border border-[#27272A] rounded-lg">
      <h3 className="text-lg font-sans mb-4">Módulo C: Captura Multimedia</h3>

      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}

      {geoData && (
        <div className="text-xs text-gray-400 mb-4">
          <p>Lat: {geoData.latitude}</p>
          <p>Lng: {geoData.longitude}</p>
          <p>Hora: {new Date(geoData.timestamp).toLocaleString()}</p>
        </div>
      )}

      {/* Hidden file input for capturing from camera */}
      <input
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="relative w-64 h-64 border-2 border-dashed border-[#10B981] flex items-center justify-center mb-4">
        {/* Alignment guides simulation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 border border-[#27272A] opacity-50"></div>
        </div>
        <p className="text-[#10B981] text-center px-4">Alinea el vehículo dentro de las guías</p>
      </div>

      <button
        onClick={requestLocationAndCapture}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Capturar con GPS
      </button>
    </div>
  );
}
