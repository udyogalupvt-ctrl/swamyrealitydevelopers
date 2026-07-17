export type PropertyType =
  | "Apartments"
  | "Residential Plots"
  | "Gated Community"
  | "Premium Plots";

export type Property = {
  slug: string;
  name: string;
  type: PropertyType;
  location: string;
  short: string;
  overview: string[];
  images: string[];
  /** Optional alt text for each entry in `images` (parallel array). */
  imageAlts?: string[];
  amenities: string[];
  highlights: string[];
  approvals: { rera: string; kauda: boolean; dtcp: boolean };
  locationAdvantages: { place: string; distance: string }[];
  mapQuery: string;
};

const commonAmenities = [
  "24x7 Security",
  "CCTV Surveillance",
  "Wide Roads",
  "Water Supply",
  "Underground Drainage",
  "Street Lighting",
  "Landscaped Parks",
  "Power Backup",
];

export const PROPERTIES: Property[] = [
  {
    slug: "mahatma-enclave",
    name: "Mahatma Enclave",
    type: "Gated Community",
    location: "Sashikanth Nagar, Kakinada",
    short: "A planned gated community with wide roads, curated greenery and 24/7 security.",
    overview: [
      "Mahatma Enclave is a fully planned gated community designed for families who value privacy, safety and a quieter neighborhood. Every plot is carved out along wide, tree-lined internal roads with underground drainage and power lines routed out of sight.",
      "The layout is walkable end-to-end, with landscaped pocket parks, dedicated visitor parking, and a single controlled entrance manned round the clock.",
    ],
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    ],
    amenities: commonAmenities,
    highlights: [
      "RERA & KAUDA approved gated layout",
      "Wide 40ft & 30ft internal roads",
      "24/7 manned security & CCTV",
      "Underground drainage & utilities",
      "Landscaped parks and open spaces",
      "Clear titles, ready for registration",
    ],
    approvals: { rera: "P02400005678", kauda: true, dtcp: true },
    locationAdvantages: [
      { place: "Sri Chaitanya School", distance: "1.2 km" },
      { place: "Government General Hospital", distance: "3.5 km" },
      { place: "NH-16 Highway", distance: "4.0 km" },
      { place: "Kakinada Port", distance: "6.8 km" },
    ],
    mapQuery: "Sashikanth Nagar, Kakinada",
  },
  {
    slug: "sri-sri-residency",
    name: "Sri Sri Residency",
    type: "Apartments",
    location: "Ramanayapeta, Kakinada",
    short: "Contemporary 2 & 3 BHK apartments with premium finishes and skyline views.",
    overview: [
      "Sri Sri Residency is a boutique apartment project in Ramanayapeta offering thoughtfully proportioned 2 and 3 BHK homes. Every unit is a corner or edge unit, ensuring cross-ventilation and natural light from at least two sides.",
      "The building sits back from the road behind a landscaped drop-off, with covered parking, a rooftop deck and a dedicated community lounge on the ground floor.",
    ],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    ],
    amenities: commonAmenities,
    highlights: [
      "RERA approved apartment tower",
      "2 & 3 BHK premium configurations",
      "Rooftop deck & community lounge",
      "Reserved covered parking",
      "Lift, backup power, water softener",
      "Ready-to-move with clear title",
    ],
    approvals: { rera: "P02400005712", kauda: true, dtcp: false },
    locationAdvantages: [
      { place: "Ramanayapeta Market", distance: "0.6 km" },
      { place: "Apollo Hospital", distance: "2.1 km" },
      { place: "Kakinada Railway Station", distance: "3.8 km" },
      { place: "NH-16 Highway", distance: "5.2 km" },
    ],
    mapQuery: "Ramanayapeta, Kakinada",
  },
  {
    slug: "swamy-satya-venkata-gardens",
    name: "Swamy Satya Venkata Gardens",
    type: "Premium Plots",
    location: "Cheediga, Kakinada",
    short: "Premium open plots in a rapidly appreciating corridor, ready for construction.",
    overview: [
      "Swamy Satya Venkata Gardens is a curated open-plot layout in Cheediga — one of Kakinada's fastest appreciating corridors. Plot sizes are generous, corners are pre-marked, and every plot faces a paved internal road.",
      "The layout is fully DTCP approved with utilities laid to the plot boundary, so buyers can begin construction the day registration is complete.",
    ],
    images: [
      "https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80",
    ],
    amenities: commonAmenities,
    highlights: [
      "DTCP & KAUDA approved layout",
      "Plot sizes from 200 – 500 sq. yards",
      "Paved internal roads",
      "Utilities laid to plot boundary",
      "High-appreciation growth corridor",
      "Clear titles, no litigation",
    ],
    approvals: { rera: "P02400005744", kauda: true, dtcp: true },
    locationAdvantages: [
      { place: "Cheediga Junction", distance: "0.4 km" },
      { place: "Proposed IT Corridor", distance: "2.5 km" },
      { place: "NH-16 Highway", distance: "3.1 km" },
      { place: "Kakinada City Center", distance: "7.5 km" },
    ],
    mapQuery: "Cheediga, Kakinada",
  },
  {
    slug: "krishna-nagar",
    name: "Krishna Nagar",
    type: "Gated Community",
    location: "Kakinada",
    short: "A compact gated community for families who want city access without city noise.",
    overview: [
      "Krishna Nagar is a compact, single-entrance gated community with 48 plots arranged around a central park. Every plot enjoys direct park access and privacy from the perimeter road.",
      "The community is designed for owner-occupiers who want proximity to schools and hospitals without the noise of a main road.",
    ],
    images: [
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    ],
    amenities: commonAmenities,
    highlights: [
      "RERA & KAUDA approved",
      "48 plots around a central park",
      "Single controlled entrance",
      "24/7 security & CCTV",
      "Underground utilities",
      "Handpicked owner-occupier community",
    ],
    approvals: { rera: "P02400005791", kauda: true, dtcp: true },
    locationAdvantages: [
      { place: "Sri Chaitanya School", distance: "1.5 km" },
      { place: "GSL Medical College", distance: "2.8 km" },
      { place: "Kakinada Bus Stand", distance: "3.6 km" },
      { place: "NH-16 Highway", distance: "4.2 km" },
    ],
    mapQuery: "Krishna Nagar, Kakinada",
  },
  {
    slug: "lalitha-vihar",
    name: "Lalitha Vihar",
    type: "Residential Plots",
    location: "Kakinada",
    short: "Residential plots on a well-connected corridor with schools and hospitals nearby.",
    overview: [
      "Lalitha Vihar is a residential plot layout on a well-connected corridor with schools, hospitals and daily needs all within a two-kilometer radius. Plots are laid out along a spine road with utility connections at every boundary.",
      "The layout is ideal for buyers who want to build a family home on their own timeline while benefiting from steady corridor-driven appreciation.",
    ],
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80",
    ],
    amenities: commonAmenities,
    highlights: [
      "DTCP approved residential plots",
      "Plot sizes from 150 – 300 sq. yards",
      "Spine road with utility hookups",
      "Nearby schools and hospitals",
      "Clear titles, straight documentation",
      "Steady corridor appreciation",
    ],
    approvals: { rera: "P02400005802", kauda: true, dtcp: true },
    locationAdvantages: [
      { place: "Bhashyam School", distance: "1.0 km" },
      { place: "Government Hospital", distance: "2.4 km" },
      { place: "Kakinada Railway Station", distance: "3.2 km" },
      { place: "NH-16 Highway", distance: "3.9 km" },
    ],
    mapQuery: "Lalitha Vihar, Kakinada",
  },
  {
    slug: "venkata-vihar",
    name: "Venkata Vihar",
    type: "Premium Plots",
    location: "Kakinada",
    short: "Premium open plots with a serene setting and easy highway access.",
    overview: [
      "Venkata Vihar is a premium open-plot layout designed for buyers who want space, privacy and easy access to the highway. Plot sizes are generous and the perimeter is bordered by open agricultural land — no back-to-back plots, ever.",
      "The layout is fully approved, with paved roads and underground utility corridors already in place.",
    ],
    images: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
    ],
    amenities: commonAmenities,
    highlights: [
      "DTCP & KAUDA approved",
      "Plots from 250 – 600 sq. yards",
      "No back-to-back plots",
      "Paved internal roads",
      "Underground utilities",
      "Easy NH-16 access",
    ],
    approvals: { rera: "P02400005817", kauda: true, dtcp: true },
    locationAdvantages: [
      { place: "NH-16 Highway", distance: "1.8 km" },
      { place: "Kakinada Port", distance: "5.4 km" },
      { place: "Sri Chaitanya School", distance: "2.6 km" },
      { place: "City Center", distance: "6.2 km" },
    ],
    mapQuery: "Venkata Vihar, Kakinada",
  },
];

export const PROPERTY_TYPES: (PropertyType | "All")[] = [
  "All",
  "Apartments",
  "Residential Plots",
  "Gated Community",
  "Premium Plots",
];

export function getProperty(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}
