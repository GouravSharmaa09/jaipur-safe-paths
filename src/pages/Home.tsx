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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <Navbar />

      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-6 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <div ref={searchRef} className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary z-10" />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin z-10" />
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
              className="pl-12 pr-14 h-14 md:h-16 text-base md:text-lg rounded-3xl shadow-elevated glass-card border-2 hover:border-primary/50 transition-all duration-300"
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-3 w-full glass-card rounded-2xl shadow-elevated overflow-hidden z-50"
                >
                  {suggestions.map((place, index) => (
                    <button
                      key={`${place.lat}-${place.lon}-${index}`}
                      onClick={() => handleSelectPlace(place)}
                      className="w-full px-5 py-4 text-left hover:bg-primary/5 transition-all duration-200 flex items-start gap-3 border-b border-border/50 last:border-b-0"
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
          className="flex flex-wrap gap-2 md:gap-3 justify-center"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full px-6 md:px-8 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105"
            >
              {category.label}
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Badge className="bg-secondary text-secondary-foreground px-4 py-2 text-sm md:text-base shadow-soft">
            🟢 Safe Zone
          </Badge>
          <Badge className="bg-accent text-accent-foreground px-4 py-2 text-sm md:text-base shadow-soft">
            🟣 Use Caution
          </Badge>
          <Badge className="bg-destructive text-destructive-foreground px-4 py-2 text-sm md:text-base shadow-soft">
            🔴 Avoid at Night
          </Badge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1 min-h-[500px] md:min-h-[600px] lg:min-h-[700px]"
        >
          <div className="h-full rounded-3xl overflow-hidden shadow-elevated">
            <MapComponent
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
