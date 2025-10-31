import { createContext, useContext, useState, ReactNode } from 'react';

interface RouteRequest {
  origin?: { lat: number; lng: number };
  destination: { lat: number; lng: number; name: string };
  timestamp: number;
}

interface MapContextType {
  routeRequest: RouteRequest | null;
  setRouteRequest: (request: RouteRequest | null) => void;
  selectedLocation: { lat: number; lng: number; name: string } | null;
  setSelectedLocation: (location: { lat: number; lng: number; name: string } | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  return (
    <MapContext.Provider value={{ routeRequest, setRouteRequest, selectedLocation, setSelectedLocation }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within MapProvider');
  }
  return context;
};

// Global function for AI agent to trigger routes
if (typeof window !== 'undefined') {
  (window as any).showRouteOnMap = (destination: { lat: number; lng: number; name: string }) => {
    const event = new CustomEvent('mapRouteRequest', { detail: destination });
    window.dispatchEvent(event);
  };
}
