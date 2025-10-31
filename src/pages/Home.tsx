import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/MapComponent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlaceSearch, PlaceSuggestion } from "@/hooks/usePlaceSearch";
import { useMap } from "@/contexts/MapContext";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading } = usePlaceSearch(searchQuery);
  const { setSelectedLocation } = useMap();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setSearchQuery(place.name);
    setShowSuggestions(false);
    setSelectedLocation({
      lat: place.lat,
      lng: place.lon,
      name: place.name
    });
  };

  const categories = [
    { id: "all", label: "All Places" },
    { id: "cafe", label: "Cafes" },
    { id: "shop", label: "Shops" },
    { id: "night", label: "Night Spots" },
    { id: "monument", label: "Monuments" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col p-4 gap-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <div ref={searchRef} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin z-10" />
            )}
            <Input
              type="search"
              placeholder="Search for places in Jaipur..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-12 h-12 rounded-2xl shadow-card"
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-card rounded-xl shadow-card border border-border overflow-hidden z-50"
                >
                  {suggestions.map((place, index) => (
                    <button
                      key={`${place.lat}-${place.lon}-${index}`}
                      onClick={() => handleSelectPlace(place)}
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
                    >
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{place.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{place.display_name}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.label}
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 justify-center"
        >
          <Badge className="bg-secondary text-secondary-foreground">
            Safe Zone
          </Badge>
          <Badge className="bg-accent text-accent-foreground">
            Use Caution
          </Badge>
          <Badge className="bg-destructive text-destructive-foreground">
            Avoid at Night
          </Badge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1 min-h-[500px]"
        >
          <MapComponent
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
