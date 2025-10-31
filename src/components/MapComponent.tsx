import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { toast } from "sonner";
import PlaceCard from "./PlaceCard";
import RouteInfoCard from "./RouteInfoCard";
import { SafetySuggestionDialog } from "./SafetySuggestionDialog";
import { places, Place } from "@/lib/mapData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Maximize2, Box } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

interface LocationCluster {
  id: string;
  lat: number;
  lng: number;
  status: "safe" | "caution" | "avoid" | "unverified";
  report_count: number;
}

interface MapComponentProps {
  selectedCategory: string;
  searchQuery: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  destination: string;
}

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (color: string, isCluster: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: ${isCluster ? "24px" : "20px"};
      height: ${isCluster ? "24px" : "20px"};
      border-radius: 50%;
      border: ${isCluster ? "3px" : "2px"} solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [isCluster ? 24 : 20, isCluster ? 24 : 20],
    iconAnchor: [isCluster ? 12 : 10, isCluster ? 12 : 10],
  });
};

const MapComponent = ({ selectedCategory, searchQuery }: MapComponentProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [clusters, setClusters] = useState<LocationCluster[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationInterval, setNavigationInterval] = useState<NodeJS.Timeout | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [selectedLocationForAI, setSelectedLocationForAI] = useState<{ name: string; location: string; reports?: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.9124, 75.7873]);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView(mapCenter, mapZoom);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Load clusters from Supabase and subscribe
  useEffect(() => {
    const loadClusters = async () => {
      const { data, error } = await supabase
        .from("location_clusters")
        .select("*");

      if (!error && data) {
        setClusters(data);
      }
    };

    loadClusters();

    const channel = supabase
      .channel("location_clusters_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "location_clusters",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setClusters((prev) => [...prev, payload.new as LocationCluster]);
            toast.success("Map updated with new reports");
          } else if (payload.eventType === "UPDATE") {
            setClusters((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as LocationCluster) : c))
            );
            toast.info("Location status updated");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error)
      );
    });
  };

  const calculateRoute = async (destination: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) {
      toast.error("Map not ready yet");
      return;
    }

    try {
      const origin = await getUserLocation();
      
      // Using OSRM (Open Source Routing Machine) for routing
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) throw new Error("Route calculation failed");
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        
        // Remove old route if exists
        if (routeLayerRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }
        
        // Create new route
        const newRouteLayer = L.polyline(coordinates, {
          color: "#3b82f6",
          weight: 5,
          opacity: 0.7,
        });

        newRouteLayer.addTo(mapInstanceRef.current);
        routeLayerRef.current = newRouteLayer;
        
        // Fit bounds to show entire route
        mapInstanceRef.current.fitBounds(newRouteLayer.getBounds(), { padding: [50, 50] });
        
        const distanceKm = (route.distance / 1000).toFixed(2);
        const durationMin = Math.round(route.duration / 60);
        
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMin} min`,
          destination: selectedPlace?.name || "Selected location",
        });

        toast.success(`Route: ${distanceKm} km • ${durationMin} min`);
      }
    } catch (error) {
      console.error("Route error:", error);
      toast.error("Could not calculate route. Enable location access.");
    }
  };

  const handleGetRoute = (place: Place) => {
    calculateRoute({ lat: place.lat, lng: place.lng });
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    toast.success("Navigation started!");

    const interval = setInterval(async () => {
      try {
        const location = await getUserLocation();
        setMapCenter([location.lat, location.lng]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng]);
        }
      } catch (error) {
        console.error("Navigation update error:", error);
      }
    }, 5000);

    setNavigationInterval(interval);
  };

  const handleCloseRoute = () => {
    setRouteInfo(null);
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (navigationInterval) {
      clearInterval(navigationInterval);
      setNavigationInterval(null);
    }
    setIsNavigating(false);
  };

  const toggle3D = () => {
    toast.info("3D view not available with Leaflet maps");
  };

  const allLocations = [
    ...places.map((p) => ({
      ...p,
      source: "hardcoded" as const,
    })),
    ...clusters.map((c) => ({
      id: c.id,
      name: `Reported Location (${c.report_count} reports)`,
      type: "Crowdsourced",
      lat: c.lat,
      lng: c.lng,
      safetyLevel: (c.status === "unverified" ? "caution" : c.status) as "safe" | "caution" | "danger" | "avoid",
      tip: `This location has ${c.report_count} user reports.`,
      category: "shop" as const,
      source: "cluster" as const,
      report_count: c.report_count,
    })),
  ];

  const filteredLocations = allLocations.filter((location) => {
    if (location.source === "hardcoded") {
      const matchesCategory = selectedCategory === "all" || location.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }
    return true;
  });

  // Update map view when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(mapCenter, mapZoom);
    }
  }, [mapCenter, mapZoom]);

  // Update markers when filters change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredLocations.forEach((location) => {
      const markerColor =
        location.safetyLevel === "safe"
          ? "#22c55e"
          : location.safetyLevel === "caution"
          ? "#a855f7"
          : "#ef4444";

      const icon = createCustomIcon(markerColor, location.source === "cluster");

      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`<strong>${location.name}</strong><br/>${location.type}`)
        .on('click', () => {
          setSelectedPlace(location);
          setRouteInfo(null);
          setSelectedLocationForAI({
            name: location.name,
            location: location.tip,
            reports: location.source === "cluster" ? (location as any).report_count : undefined,
          });
          setShowSafetyDialog(true);
        });

      markersRef.current.push(marker);
    });
  }, [filteredLocations, selectedCategory, searchQuery]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative w-full h-full rounded-2xl overflow-hidden shadow-card ${
          isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""
        }`}
      >
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="shadow-lg"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={toggle3D}
            className={`shadow-lg ${is3D ? "bg-primary text-primary-foreground" : ""}`}
          >
            <Box className="h-5 w-5" />
          </Button>
        </div>

        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ minHeight: isFullScreen ? "100vh" : "500px" }}
        />

        {selectedPlace && !isFullScreen && (
          <PlaceCard
            name={selectedPlace.name}
            type={selectedPlace.type}
            safetyLevel={selectedPlace.safetyLevel}
            tip={selectedPlace.tip}
            onClose={() => setSelectedPlace(null)}
            onGetRoute={() => handleGetRoute(selectedPlace)}
          />
        )}

        {routeInfo && (
          <RouteInfoCard
            distance={routeInfo.distance}
            duration={routeInfo.duration}
            destination={routeInfo.destination}
            isNavigating={isNavigating}
            onStartNavigation={handleStartNavigation}
            onClose={handleCloseRoute}
          />
        )}
      </motion.div>

      {selectedLocationForAI && (
        <SafetySuggestionDialog
          open={showSafetyDialog}
          onOpenChange={setShowSafetyDialog}
          placeName={selectedLocationForAI.name}
          location={selectedLocationForAI.location}
          userReports={selectedLocationForAI.reports}
        />
      )}
    </>
  );
};

export default MapComponent;
