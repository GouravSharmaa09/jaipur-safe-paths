import { useState, useEffect, useCallback } from 'react';

export interface PlaceSuggestion {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
  };
}

export const usePlaceSearch = (query: string, debounceMs = 500) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Using Nominatim for place search - focusing on Jaipur area
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery + ', Jaipur, Rajasthan, India')}` +
        `&format=json&limit=8&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SafeBazaarApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Filter and format results
      const formattedSuggestions: PlaceSuggestion[] = data
        .map((item: any) => ({
          name: item.name || item.display_name.split(',')[0],
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type || 'location',
          address: item.address
        }))
        .filter((item: PlaceSuggestion) => {
          // Only show results within reasonable distance of Jaipur
          const jaipurLat = 26.9124;
          const jaipurLng = 75.7873;
          const distance = Math.sqrt(
            Math.pow(item.lat - jaipurLat, 2) + 
            Math.pow(item.lon - jaipurLng, 2)
          );
          return distance < 1; // Roughly 100km radius
        });

      setSuggestions(formattedSuggestions);
    } catch (err) {
      console.error('Place search error:', err);
      setError('Failed to search places');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, searchPlaces]);

  return { suggestions, loading, error };
};
