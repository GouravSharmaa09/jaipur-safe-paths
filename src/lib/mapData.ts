export interface Place {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  safetyLevel: "safe" | "caution" | "danger" | "avoid";
  tip: string;
  category: "cafe" | "shop" | "night" | "monument";
}

export interface RouteSegment {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  safetyLevel: "safe" | "caution" | "danger";
  warning?: string;
}

// Hardcoded safety levels for common routes in Jaipur
export const routeSafetyData: RouteSegment[] = [
  // Safe main roads during day
  {
    start: { lat: 26.9124, lng: 75.7873 }, // Central Jaipur
    end: { lat: 26.9855, lng: 75.8513 }, // Amber Fort
    safetyLevel: "safe",
  },
  {
    start: { lat: 26.9239, lng: 75.8267 }, // Hawa Mahal
    end: { lat: 26.9255, lng: 75.8237 }, // City Palace
    safetyLevel: "safe",
  },
  // Caution zones - crowded markets
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9195, lng: 75.8265 }, // Johri Bazaar
    safetyLevel: "caution",
    warning: "Crowded market area. Keep belongings secure.",
  },
  {
    start: { lat: 26.9255, lng: 75.8237 },
    end: { lat: 26.9185, lng: 75.8221 }, // Bapu Bazaar
    safetyLevel: "caution",
    warning: "Narrow lanes, watch for traffic and crowds.",
  },
  // Danger zones - night time routes
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9369, lng: 75.8155 }, // Nahargarh Road
    safetyLevel: "danger",
    warning: "Isolated area. Avoid after sunset. Travel in groups during day.",
  },
  {
    start: { lat: 26.9195, lng: 75.8265 },
    end: { lat: 26.9185, lng: 75.8221 }, // Late night bazaar route
    safetyLevel: "danger",
    warning: "Not recommended after 9 PM. Poor lighting and isolated.",
  },
  // Women Empowerment Centers - Safe Routes
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9210, lng: 75.8190 }, // Women's Self-Help Center
    safetyLevel: "safe",
  },
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9145, lng: 75.7895 }, // Mahila Shakti Kendra
    safetyLevel: "safe",
  },
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9180, lng: 75.7980 }, // Women's Police Station
    safetyLevel: "safe",
  },
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9320, lng: 75.8100 }, // Sakhi One Stop Center
    safetyLevel: "safe",
  },
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9095, lng: 75.8340 }, // Women's Vocational Training
    safetyLevel: "safe",
  },
  {
    start: { lat: 26.9124, lng: 75.7873 },
    end: { lat: 26.9125, lng: 75.8015 }, // Pink Auto Stand
    safetyLevel: "safe",
  },
];

// Function to get route safety level based on destination
export const getRouteSafetyLevel = (destination: { lat: number; lng: number }): {
  level: "safe" | "caution" | "danger";
  warning?: string;
} => {
  // Check if destination matches any known dangerous locations
  const dangerousLocations = places.filter(p => p.safetyLevel === "danger" || p.safetyLevel === "avoid");
  const isDangerous = dangerousLocations.some(loc => 
    Math.abs(loc.lat - destination.lat) < 0.01 && 
    Math.abs(loc.lng - destination.lng) < 0.01
  );

  if (isDangerous) {
    return {
      level: "danger",
      warning: "Destination is in a high-risk area. Exercise extreme caution or avoid."
    };
  }

  // Check if route passes through any danger zones
  const cautionLocations = places.filter(p => p.safetyLevel === "caution");
  const needsCaution = cautionLocations.some(loc => 
    Math.abs(loc.lat - destination.lat) < 0.01 && 
    Math.abs(loc.lng - destination.lng) < 0.01
  );

  if (needsCaution) {
    return {
      level: "caution",
      warning: "Crowded area. Keep valuables secure and stay alert."
    };
  }

  // Check time of day
  const currentHour = new Date().getHours();
  if (currentHour >= 21 || currentHour < 6) {
    return {
      level: "caution",
      warning: "Traveling at night. Stay on main roads and consider traveling in groups."
    };
  }

  return { level: "safe" };
};

export const places: Place[] = [
  {
    id: "1",
    name: "Cafe Palladio",
    type: "Cafe",
    lat: 26.9224,
    lng: 75.8231,
    safetyLevel: "safe",
    tip: "Popular tourist cafe with great ambiance. Safe for solo travelers at all times.",
    category: "cafe",
  },
  {
    id: "2",
    name: "Anokhi Museum",
    type: "Museum & Shop",
    lat: 26.9162,
    lng: 75.8077,
    safetyLevel: "safe",
    tip: "Authentic handicrafts. Well-lit area, safe for shopping during day and evening.",
    category: "shop",
  },
  {
    id: "3",
    name: "Hawa Mahal",
    type: "Monument",
    lat: 26.9239,
    lng: 75.8267,
    safetyLevel: "safe",
    tip: "Iconic pink palace. Crowded tourist spot with good security.",
    category: "monument",
  },
  {
    id: "4",
    name: "City Palace Market",
    type: "Shopping",
    lat: 26.9255,
    lng: 75.8237,
    safetyLevel: "safe",
    tip: "Busy market area near City Palace. Safe during daylight hours.",
    category: "shop",
  },
  {
    id: "5",
    name: "Tapri Central",
    type: "Cafe",
    lat: 26.9186,
    lng: 75.8125,
    safetyLevel: "safe",
    tip: "Rooftop cafe popular among locals and tourists. Safe spot to relax.",
    category: "cafe",
  },
  {
    id: "6",
    name: "Johri Bazaar",
    type: "Jewelry Market",
    lat: 26.9195,
    lng: 75.8265,
    safetyLevel: "caution",
    tip: "Famous jewelry market. Can get crowded. Keep belongings secure.",
    category: "shop",
  },
  {
    id: "7",
    name: "Bapu Bazaar Late Night",
    type: "Night Market",
    lat: 26.9185,
    lng: 75.8221,
    safetyLevel: "danger",
    tip: "Avoid after 9 PM. Narrow lanes with poor lighting. Visit during daytime only.",
    category: "night",
  },
  {
    id: "8",
    name: "Nahargarh Road After Dark",
    type: "Road",
    lat: 26.9369,
    lng: 75.8155,
    safetyLevel: "danger",
    tip: "Isolated area at night. Avoid traveling alone after sunset.",
    category: "night",
  },
  {
    id: "9",
    name: "Jal Mahal Cafe",
    type: "Cafe",
    lat: 26.9535,
    lng: 75.8467,
    safetyLevel: "safe",
    tip: "Scenic lakeside cafe. Safe and well-maintained tourist area.",
    category: "cafe",
  },
  {
    id: "10",
    name: "Amber Fort",
    type: "Monument",
    lat: 26.9855,
    lng: 75.8513,
    safetyLevel: "safe",
    tip: "Major tourist attraction with security. Safe during visiting hours.",
    category: "monument",
  },
  {
    id: "11",
    name: "Women's Self-Help Center",
    type: "Women Empowerment",
    lat: 26.9210,
    lng: 75.8190,
    safetyLevel: "safe",
    tip: "24/7 support center for women. Safe space with trained counselors and legal aid.",
    category: "shop",
  },
  {
    id: "12",
    name: "Mahila Shakti Kendra",
    type: "Women Empowerment",
    lat: 26.9145,
    lng: 75.7895,
    safetyLevel: "safe",
    tip: "Government initiative for women empowerment. Skill training and safety workshops available.",
    category: "shop",
  },
  {
    id: "13",
    name: "Women's Police Station",
    type: "Women Safety",
    lat: 26.9180,
    lng: 75.7980,
    safetyLevel: "safe",
    tip: "Dedicated women's police station. 24/7 emergency response and support services.",
    category: "shop",
  },
  {
    id: "14",
    name: "Sakhi One Stop Center",
    type: "Women Support",
    lat: 26.9320,
    lng: 75.8100,
    safetyLevel: "safe",
    tip: "Comprehensive support center. Medical aid, counseling, and legal assistance for women in distress.",
    category: "shop",
  },
  {
    id: "15",
    name: "Women's Vocational Training Institute",
    type: "Women Empowerment",
    lat: 26.9095,
    lng: 75.8340,
    safetyLevel: "safe",
    tip: "Skill development center for women. Safe environment with career counseling services.",
    category: "shop",
  },
  {
    id: "16",
    name: "Pink Auto Stand (Women Drivers)",
    type: "Women Safety Transport",
    lat: 26.9125,
    lng: 75.8015,
    safetyLevel: "safe",
    tip: "Auto rickshaws driven by trained women drivers. Safe transport option for women travelers.",
    category: "shop",
  },
];
