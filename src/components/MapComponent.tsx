import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import PlaceCard from "./PlaceCard";
import NavigationBar from "./NavigationBar";
import RouteInfoCard from "./RouteInfoCard";
import { places, Place, getRouteSafetyLevel } from "@/lib/mapData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMap } from "@/contexts/MapContext";
import { useToast } from "@/hooks/use-toast";
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
  safetyLevel?: "safe" | "caution" | "danger";
  safetyWarning?: string;
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
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.9124, 75.7873]);
  const [mapZoom, setMapZoom] = useState(13);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { selectedLocation, routeRequest } = useMap();
  const { toast } = useToast();

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView(mapCenter, mapZoom);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Track user zoom interactions

    // Add click handler for map
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      // Get location address
      const address = await reverseGeocode(lat, lng);
      setLocationAddress(address);
      
      // Create temporary place for clicked location
      const clickedPlace: Place = {
        id: 'clicked-location',
        name: 'Selected Location',
        type: 'Map Click',
        lat,
        lng,
        safetyLevel: 'caution',
        tip: 'Location selected from map. Check for nearby safety reports.',
        category: 'shop'
      };
      
      setSelectedPlace(clickedPlace);
      
      // Calculate route to clicked location
      calculateRoute({ lat, lng });
      
      // Add temporary marker at clicked location
      const tempMarker = L.marker([lat, lng], {
        icon: createCustomIcon('#3b82f6', false)
      }).addTo(map).bindPopup(`<strong>Selected Location</strong><br/>${address}`).openPopup();
      
      // Store reference to remove later
      markersRef.current.push(tempMarker);
    });

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
          } else if (payload.eventType === "UPDATE") {
            setClusters((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as LocationCluster) : c))
            );
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
        
        // Fit the map to show the entire route with some padding
        const bounds = newRouteLayer.getBounds();
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
          duration: 1
        });
        
        const distanceKm = (route.distance / 1000).toFixed(2);
        const durationMin = Math.round(route.duration / 60);
        
        // Get safety level for this route
        const routeSafety = getRouteSafetyLevel(destination);
        
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMin} min`,
          destination: selectedPlace?.name || "Selected location",
          safetyLevel: routeSafety.level,
          safetyWarning: routeSafety.warning,
        });
        
        // Show safety toast if there's a warning
        if (routeSafety.warning) {
          toast({
            title: `Route Safety: ${routeSafety.level.toUpperCase()}`,
            description: routeSafety.warning,
            variant: routeSafety.level === "danger" ? "destructive" : "default",
          });
        }
      }
    } catch (error) {
      console.error("Route error:", error);
    }
  };

  const handleGetRoute = (place: Place) => {
    calculateRoute({ lat: place.lat, lng: place.lng });
  };

  const handleStartNavigation = async () => {
    setIsNavigating(true);

    try {
      // Get initial location and zoom to street-level navigation view
      const location = await getUserLocation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([location.lat, location.lng], 17, {
          animate: true,
          duration: 1
        });
      }
    } catch (error) {
      console.error("Initial navigation position error:", error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location",
        variant: "destructive"
      });
      setIsNavigating(false);
      return;
    }

    // Update location every 3 seconds during navigation
    const interval = setInterval(async () => {
      try {
        const location = await getUserLocation();
        
        if (mapInstanceRef.current) {
          // Get current zoom level from map (respects user's manual zoom)
          const currentZoom = mapInstanceRef.current.getZoom();
          
          // Smoothly pan to new location while maintaining zoom
          mapInstanceRef.current.setView([location.lat, location.lng], currentZoom, {
            animate: true,
            duration: 1,
            easeLinearity: 0.5
          });
        }
      } catch (error) {
        console.error("Navigation update error:", error);
      }
    }, 3000); // Update every 3 seconds for smoother tracking

    setNavigationInterval(interval);
  };

  const handleCenterOnLocation = async () => {
    try {
      const location = await getUserLocation();
      if (mapInstanceRef.current) {
        // Get current zoom or use a reasonable default
        const currentZoom = mapInstanceRef.current.getZoom() || 15;
        mapInstanceRef.current.setView([location.lat, location.lng], currentZoom, {
          animate: true,
          duration: 1
        });
      }
    } catch (error) {
      console.error("Center location error:", error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location",
        variant: "destructive"
      });
    }
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

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'JaipurSafetyApp/1.0'
          }
        }
      );
      
      if (!response.ok) throw new Error("Geocoding failed");
      
      const data = await response.json();
      
      // Build a nice address string
      const parts = [];
      if (data.address.road) parts.push(data.address.road);
      if (data.address.suburb) parts.push(data.address.suburb);
      if (data.address.city) parts.push(data.address.city);
      else if (data.address.town) parts.push(data.address.town);
      if (data.address.state) parts.push(data.address.state);
      
      return parts.length > 0 ? parts.join(", ") : data.display_name;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Location address unavailable";
    }
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

  // Update map view when center changes - REMOVED to prevent zoom conflicts during navigation

  // Handle selected location from search
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return;

    // Center map on selected location
    mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 15, {
      animate: true,
      duration: 1
    });

    // Find if this location matches any existing place/cluster
    const matchingPlace = allLocations.find(loc => 
      Math.abs(loc.lat - selectedLocation.lat) < 0.01 && 
      Math.abs(loc.lng - selectedLocation.lng) < 0.01
    );

    if (matchingPlace) {
      setSelectedPlace(matchingPlace);
      calculateRoute({ lat: matchingPlace.lat, lng: matchingPlace.lng });
    } else {
      // Create a temporary place marker
      const tempPlace: Place = {
        id: 'temp-search',
        name: selectedLocation.name,
        type: 'Searched Location',
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        safetyLevel: 'caution',
        tip: 'Check local reports for safety information',
        category: 'shop'
      };
      setSelectedPlace(tempPlace);
      
      // Get address and safety info
      reverseGeocode(selectedLocation.lat, selectedLocation.lng).then(setLocationAddress);
      
      // Check if there are nearby clusters for safety info
      const nearbyCluster = clusters.find(c => {
        const distance = Math.sqrt(
          Math.pow(c.lat - selectedLocation.lat, 2) + 
          Math.pow(c.lng - selectedLocation.lng, 2)
        );
        return distance < 0.01;
      });

      if (nearbyCluster) {
        toast({
          title: "Safety Information",
          description: `This area has ${nearbyCluster.report_count} user reports. Status: ${nearbyCluster.status}`,
        });
      }
      
      calculateRoute({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [selectedLocation, clusters]);

  // Handle route requests from AI agent
  useEffect(() => {
    if (!routeRequest) return;

    const { destination } = routeRequest;
    
    // Find or create place for destination
    const matchingPlace = allLocations.find(loc => 
      Math.abs(loc.lat - destination.lat) < 0.01 && 
      Math.abs(loc.lng - destination.lng) < 0.01
    );

    const placeToShow = matchingPlace || {
      id: 'ai-route',
      name: destination.name,
      type: 'AI Suggested Route',
      lat: destination.lat,
      lng: destination.lng,
      safetyLevel: 'caution' as const,
      tip: 'Route suggested by AI assistant',
      category: 'shop' as const
    };

    setSelectedPlace(placeToShow);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([destination.lat, destination.lng], 14, {
        animate: true,
        duration: 1
      });
    }
    
    calculateRoute({ lat: destination.lat, lng: destination.lng });
    
    toast({
      title: "Route Calculated",
      description: `Showing route to ${destination.name}`,
    });
  }, [routeRequest]);

  // Listen for AI agent route requests
  useEffect(() => {
    const handleRouteRequest = (event: any) => {
      const { detail } = event;
      if (detail && detail.lat && detail.lng && detail.name) {
        const placeToShow: Place = {
          id: 'ai-route',
          name: detail.name,
          type: 'AI Suggested Route',
          lat: detail.lat,
          lng: detail.lng,
          safetyLevel: 'caution',
          tip: 'Route suggested by AI assistant',
          category: 'shop'
        };
        
        setSelectedPlace(placeToShow);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([detail.lat, detail.lng], 14, {
            animate: true,
            duration: 1
          });
        }
        
        calculateRoute({ lat: detail.lat, lng: detail.lng });
        
        toast({
          title: "Route from AI Chat",
          description: `Showing route to ${detail.name}`,
        });
      }
    };

    window.addEventListener('mapRouteRequest', handleRouteRequest);
    return () => window.removeEventListener('mapRouteRequest', handleRouteRequest);
  }, []);

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
        .on('click', async () => {
          setSelectedPlace(location);
          setRouteInfo(null);
          
          // Get address for the location
          const address = await reverseGeocode(location.lat, location.lng);
          setLocationAddress(address);
          
          // Auto-calculate route to show distance/duration
          calculateRoute({ lat: location.lat, lng: location.lng });
        });

      markersRef.current.push(marker);
    });
  }, [filteredLocations, selectedCategory, searchQuery]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative w-full h-full rounded-3xl overflow-hidden shadow-elevated ${
          isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""
        }`}
      >
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="shadow-glow hover:scale-110 transition-transform duration-300"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>

        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ minHeight: isFullScreen ? "100vh" : "500px" }}
        />

        {selectedPlace && !isFullScreen && !isNavigating && (
          <PlaceCard
            name={selectedPlace.name}
            type={selectedPlace.type}
            safetyLevel={selectedPlace.safetyLevel}
            tip={selectedPlace.tip}
            address={locationAddress}
            routeInfo={routeInfo ? {
              distance: routeInfo.distance,
              duration: routeInfo.duration,
              safetyLevel: routeInfo.safetyLevel,
              safetyWarning: routeInfo.safetyWarning,
            } : undefined}
            isNavigating={isNavigating}
            onClose={() => {
              setSelectedPlace(null);
              setLocationAddress("");
              handleCloseRoute();
            }}
            onGetRoute={() => handleGetRoute(selectedPlace)}
            onStartNavigation={handleStartNavigation}
          />
        )}
      </motion.div>

      {isNavigating && routeInfo && !isFullScreen && (
        <NavigationBar
          destination={routeInfo.destination}
          distance={routeInfo.distance}
          duration={routeInfo.duration}
          onClose={handleCloseRoute}
        />
      )}
    </>
  );
};

export default MapComponent;
