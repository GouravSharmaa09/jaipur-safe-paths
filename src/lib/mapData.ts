export interface Place {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  safetyLevel: "safe" | "caution" | "danger";
  tip: string;
  category: "cafe" | "shop" | "night" | "monument";
}

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
];
