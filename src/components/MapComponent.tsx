import { useEffect, useRef, useState } from "react";
import { places, Place } from "@/lib/mapData";
import PlaceCard from "./PlaceCard";
import RouteInfoCard from "./RouteInfoCard";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface MapComponentProps {
  selectedCategory: string;
  searchQuery: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  destination: string;
}

const MapComponent = ({ selectedCategory, searchQuery }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const directionsRendererRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD0Mm3V597PPRlVRJBIfScym_q-Bov7DWs`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 26.9124, lng: 75.7873 },
      zoom: 13,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    
    // Initialize directions renderer
    const renderer = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#3b82f6",
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });
    directionsRendererRef.current = renderer;
    
    setMap(mapInstance);
  }, [isLoaded]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Filter places
    const filteredPlaces = places.filter((place) => {
      const matchesCategory =
        selectedCategory === "all" || place.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Add markers with animation delay
    filteredPlaces.forEach((place, index) => {
      setTimeout(() => {
        const markerColor =
          place.safetyLevel === "safe"
            ? "#22c55e"
            : place.safetyLevel === "caution"
            ? "#a855f7"
            : "#ef4444";

        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map,
          title: place.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: markerColor,
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          animation: google.maps.Animation.DROP,
        });

        marker.addListener("click", () => {
          setSelectedPlace(place);
        });

        markersRef.current.push(marker);
      }, index * 100);
    });
  }, [map, selectedCategory, searchQuery]);

  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const calculateRoute = async (destination: { lat: number; lng: number }) => {
    if (!map || !directionsRendererRef.current) return;

    try {
      const origin = await getUserLocation();

      // Add or update user location marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(origin);
      } else {
        userMarkerRef.current = new google.maps.Marker({
          position: origin,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: "Your Location",
        });
      }

      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      directionsRendererRef.current.setDirections(result);

      const route = result.routes[0];
      const leg = route.legs[0];

      setRouteInfo({
        distance: leg.distance?.text || "Unknown",
        duration: leg.duration?.text || "Unknown",
        destination: selectedPlace?.name || "Selected location",
      });

      toast({
        title: "Route calculated",
        description: `${leg.distance?.text} • ${leg.duration?.text}`,
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      if (error instanceof GeolocationPositionError) {
        toast({
          title: "Location access denied",
          description: "Please enable location access to use navigation.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Route calculation failed",
          description: "Couldn't find a route to this location.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGetRoute = () => {
    if (selectedPlace) {
      calculateRoute({ lat: selectedPlace.lat, lng: selectedPlace.lng });
    }
  };

  const handleStartNavigation = () => {
    if (!isNavigating && userLocation && map) {
      setIsNavigating(true);
      
      // Center map on user location with higher zoom
      map.setCenter(userLocation);
      map.setZoom(16);

      toast({
        title: "Navigation started",
        description: "Follow the blue route to your destination.",
      });

      // Simulate navigation updates (in production, use actual GPS tracking)
      const navigationInterval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(newLocation);
            if (userMarkerRef.current) {
              userMarkerRef.current.setPosition(newLocation);
            }
            map?.setCenter(newLocation);
          });
        }
      }, 5000); // Update every 5 seconds

      // Store interval ID for cleanup
      (window as any).navigationInterval = navigationInterval;
    } else {
      setIsNavigating(false);
      if ((window as any).navigationInterval) {
        clearInterval((window as any).navigationInterval);
      }
      toast({
        title: "Navigation stopped",
        description: "You can restart navigation anytime.",
      });
    }
  };

  const handleCloseRoute = () => {
    setRouteInfo(null);
    setIsNavigating(false);
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    if ((window as any).navigationInterval) {
      clearInterval((window as any).navigationInterval);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        ref={mapRef}
        className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-card"
        style={{ height: '100%' }}
      />
      <AnimatePresence>
        {selectedPlace && (
          <PlaceCard
            {...selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onGetRoute={handleGetRoute}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {routeInfo && (
          <RouteInfoCard
            {...routeInfo}
            isNavigating={isNavigating}
            onStartNavigation={handleStartNavigation}
            onClose={handleCloseRoute}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MapComponent;
