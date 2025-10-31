import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import PlaceCard from "./PlaceCard";
import RouteInfoCard from "./RouteInfoCard";
import { SafetySuggestionDialog } from "./SafetySuggestionDialog";
import { places, Place } from "@/lib/mapData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Maximize2, Box, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

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

const MapComponent = ({ selectedCategory, searchQuery }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [clusters, setClusters] = useState<LocationCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const directionsRenderer = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationInterval, setNavigationInterval] = useState<NodeJS.Timeout | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [selectedLocationForAI, setSelectedLocationForAI] = useState<{ name: string; location: string; reports?: number } | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: 26.9124, lng: 75.7873 },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "all",
            stylers: [{ saturation: -20 }]
          }
        ],
      });

      directionsRenderer.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#3b82f6",
          strokeWeight: 5,
        },
      });
      directionsRenderer.current.setMap(mapInstance);

      setMap(mapInstance);
      setIsLoading(false);
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD0Mm3V597PPRlVRJBIfScym_q-Bov7DWs`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [map]);

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

  // Render markers
  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

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

    filteredLocations.forEach((location, index) => {
      setTimeout(() => {
        const markerColor =
          location.safetyLevel === "safe"
            ? "#22c55e"
            : location.safetyLevel === "caution"
            ? "#a855f7"
            : "#ef4444";

        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: location.source === "cluster" ? 12 : 10,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: location.source === "cluster" ? 3 : 2,
          },
          animation: google.maps.Animation.DROP,
        });

        marker.addListener("click", () => {
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
      }, index * 100);
    });
  }, [map, selectedCategory, searchQuery, clusters]);

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
    if (!map || !directionsRenderer.current) return;

    try {
      const origin = await getUserLocation();
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      directionsRenderer.current.setDirections(result);

      const leg = result.routes[0].legs[0];

      setRouteInfo({
        distance: leg.distance?.text || "Unknown",
        duration: leg.duration?.text || "Unknown",
        destination: selectedPlace?.name || "Selected location",
      });

      toast.success(`Route: ${leg.distance?.text} • ${leg.duration?.text}`);
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
    setVoiceEnabled(true);
    toast.success("Navigation started!");

    if (routeInfo) {
      speakNavigation(`Starting navigation to ${routeInfo.destination}`);
    }

    const interval = setInterval(async () => {
      try {
        const location = await getUserLocation();
        map?.setCenter(location);
      } catch (error) {
        console.error("Navigation update error:", error);
      }
    }, 5000);

    setNavigationInterval(interval);
  };

  const handleCloseRoute = () => {
    setRouteInfo(null);
    if (directionsRenderer.current) {
      directionsRenderer.current.setMap(null);
      directionsRenderer.current.setMap(map);
    }
    if (navigationInterval) {
      clearInterval(navigationInterval);
      setNavigationInterval(null);
    }
    setIsNavigating(false);
    setVoiceEnabled(false);
  };

  const toggle3D = () => {
    if (map) {
      if (!is3D) {
        map.setTilt(45);
        map.setHeading(90);
        setIs3D(true);
        toast.success("3D view enabled");
      } else {
        map.setTilt(0);
        map.setHeading(0);
        setIs3D(false);
        toast.success("3D view disabled");
      }
    }
  };

  const speakNavigation = async (instruction: string) => {
    if (!voiceEnabled) return;

    try {
      const { data, error } = await supabase.functions.invoke("voice-navigation", {
        body: { instruction, language: "english" },
      });

      if (error) throw error;

      if ("speechSynthesis" in window && data?.instruction) {
        const utterance = new SpeechSynthesisUtterance(data.instruction);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Voice navigation error:", error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative w-full h-full rounded-2xl overflow-hidden shadow-card ${
          isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""
        }`}
      >
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
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
          {isNavigating && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`shadow-lg ${voiceEnabled ? "bg-primary text-primary-foreground" : ""}`}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          )}
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
