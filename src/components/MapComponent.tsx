import { useEffect, useRef, useState } from "react";
import { places, Place } from "@/lib/mapData";
import PlaceCard from "./PlaceCard";
import { motion, AnimatePresence } from "framer-motion";

interface MapComponentProps {
  selectedCategory: string;
  searchQuery: string;
}

const MapComponent = ({ selectedCategory, searchQuery }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        ref={mapRef}
        className="w-full h-full rounded-2xl overflow-hidden shadow-card"
      />
      <AnimatePresence>
        {selectedPlace && (
          <PlaceCard
            {...selectedPlace}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MapComponent;
