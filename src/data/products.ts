export interface Product {
  id: string;
  name: string;
  category: string;
  timber: string;
  price: number;
  image: string;
  dimensions: string;
  description: string;
  isPopular?: boolean;
  link: string;
  tagline?: string;
  leadTime?: string;
  gallery?: { src: string; alt: string; title: string }[];
  timbers?: {
    id: string;
    name: string;
    provenance: string;
    swatch: string;
    price: number;
    desc: string;
    origin?: string;
    region?: string;
    swatchImage?: string;
    slug?: string;
  }[];
  woodOptions?: {
    id: string;
    name: string;
    provenance: string;
    swatch: string;
    price: number;
    desc: string;
    origin?: string;
    region?: string;
    swatchImage?: string;
    slug?: string;
  }[];
  features?: string[];
  specs?: { label: string; value: string }[];
}

export const allProducts: Product[] = [
  {
    id: "malabar-dining-chair",
    name: "Malabar Rattan Dining Chair",
    category: "Dining",
    timber: "Indian Rosewood",
    price: 28500,
    image: "/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png",
    dimensions: "W 54cm × D 56cm × H 82cm",
    description: "Curved woven cane backrest with tapered legs and hand-cut mortise and tenon joinery.",
    isPopular: true,
    link: "/products/malabar-dining-chair",
    tagline: "Ergonomic rattan backrest sculpted for Bengaluru dinner gatherings.",
    leadTime: "In Stock — 48hr Bangalore Delivery",
    gallery: [
      {
        src: "/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png",
        alt: "Malabar Dining Chair in solid Indian Rosewood with curved cane rattan backrest",
        title: "45° Studio Perspective",
      },
      {
        src: "/images/stitch_screen_e1a112d35ebd4db8b6f1fd9abded5f9e.png",
        alt: "Malabar Dining Chair side profile showing tapered legs and curved back spine",
        title: "Side Profile & Spine",
      },
      {
        src: "/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png",
        alt: "Malabar Dining Chair front alignment photography",
        title: "Front Alignment",
      },
      {
        src: "/images/stitch_screen_9e6fefca1fcd4a72bece565d08906c86.png",
        alt: "Malabar Dining Chair in Bangalore dining room setting",
        title: "In-Situ: Bangalore Penthouse",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood (Sheesham)",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 28500,
        desc: "Dense burgundy-chocolate heartwood with natural dramatic swirl grain.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 26500,
        desc: "Golden amber tones with straight linear grain and high natural oils.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 25000,
        desc: "Muted olive-golden hues with calm, serene minimalist grain fiber.",
      },
    ],
    features: [
      "100% Solid Indian Hardwood — zero veneers, zero MDF",
      "Six-Way Hand-Woven Calamus rotang natural rattan back",
      "Traditional blind mortise & tenon joinery pinned with hardwood dowels",
      "Naturally seasoned to 8–10% equilibrium moisture content",
    ],
    specs: [
      { label: "Width", value: "54 cm (21.2 inches)" },
      { label: "Depth", value: "56 cm (22.0 inches)" },
      { label: "Total Height", value: "82 cm (32.3 inches)" },
      { label: "Seat Height", value: "45 cm (Standard Dining)" },
      { label: "Weight", value: "7.2 kg solid heartwood" },
      { label: "Finish", value: "Hand-rubbed organic beeswax & tung oil" },
    ],
  },
  {
    id: "hunsur-teak-dining-table",
    name: "Hunsur Architectural Dining Table",
    category: "Dining",
    timber: "Hunsur Teak",
    price: 85000,
    image: "/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png",
    dimensions: "L 220cm × W 95cm × H 76cm",
    description: "Solid 45mm thick Hunsur teak tabletop with chamfered undercut edge and bridge base.",
    isPopular: true,
    link: "/products/hunsur-teak-dining-table",
    tagline: "Monolithic timber slab table anchored with solid trestle joinery.",
    leadTime: "Built to Order — 10 to 14 Days",
    gallery: [
      {
        src: "/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png",
        alt: "Solid Hunsur Teak Architectural Dining Table in bright dining space",
        title: "Architectural Perspective",
      },
      {
        src: "/images/img_037_stitch.png",
        alt: "Artisans hand-planing monolithic teak slab",
        title: "Workshop Slab Selection",
      },
      {
        src: "/images/img_040_stitch.png",
        alt: "Joinery and edge profile detailing",
        title: "Hand Jack-Planing Detail",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 98000,
        desc: "Dramatic dark chocolate swirls with natural amber chatoyancy.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 85000,
        desc: "Rich honey gold with deep natural oils and high water resistance.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 78000,
        desc: "Muted olive-golden tones with tranquil linear grain, seasoned to perfection.",
      },
    ],
    features: [
      "Continuous grain-matched planks selected from single teak logs",
      "Breadboard ends with expansion slots allowing seasonal breathability",
      "Chamfered undercut rim providing lightweight visual floating stance",
      "Seated capacity: Comfortably accommodates 8 diners",
    ],
    specs: [
      { label: "Length", value: "220 cm (86.6 inches)" },
      { label: "Width", value: "95 cm (37.4 inches)" },
      { label: "Height", value: "76 cm (30 inches)" },
      { label: "Tabletop Thickness", value: "45 mm monolithic solid wood" },
      { label: "Weight", value: "68 kg solid timber" },
      { label: "Finish", value: "Food-safe natural wax and hardwax oil" },
    ],
  },
  {
    id: "fluted-tambour-credenza",
    name: "Fluted Tambour Credenza Sideboard",
    category: "Storage",
    timber: "Hunsur Teak",
    price: 72000,
    image: "/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png",
    dimensions: "L 180cm × D 45cm × H 65cm",
    description: "Seamless sliding fluted wood tambour doors with solid brass turned pill pulls.",
    isPopular: true,
    link: "/products/fluted-tambour-credenza",
    tagline: "Precision tactile wood slats sliding silently along curved beech tracks.",
    leadTime: "In Stock — 48hr Bangalore Delivery",
    gallery: [
      {
        src: "/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png",
        alt: "Fluted Tambour Credenza in Hunsur Teak with sliding curved doors",
        title: "Front View & Brass Accents",
      },
      {
        src: "/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png",
        alt: "Console profile with fluted textures",
        title: "Fluting & Texture Detail",
      },
      {
        src: "/images/img_027_stitch.png",
        alt: "Credenza in residential interior",
        title: "Living Room Setting",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 79000,
        desc: "Dark ebony-violet grain contrasted against aged brushed brass.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 72000,
        desc: "Warm golden hue with satin natural sheen and turned solid brass pulls.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 67000,
        desc: "Subtle olive-gold heartwood grain paired with unlacquered brass hardware.",
      },
    ],
    features: [
      "Custom hand-milled tambour slats bonded with natural linen canvas backing",
      "Concealed rear wire management grommets for media & vinyl turntables",
      "Adjustable interior shelves crafted from solid teak planks",
      "Turned solid brass cylindrical handles with brushed finish",
    ],
    specs: [
      { label: "Length", value: "180 cm (70.8 inches)" },
      { label: "Depth", value: "45 cm (17.7 inches)" },
      { label: "Height", value: "65 cm (25.6 inches)" },
      { label: "Shelving", value: "2 Removable Solid Wood Shelves" },
      { label: "Weight", value: "48 kg" },
      { label: "Hardware", value: "Unlacquered Solid Brass" },
    ],
  },
  {
    id: "kaveri-coffee-table",
    name: "Kaveri Low-Slung Coffee Table",
    category: "Living",
    timber: "Indian Rosewood",
    price: 46000,
    image: "/images/stitch_screen_7a4f3197cdd546acae59563d24b1dc02.png",
    dimensions: "L 130cm × W 70cm × H 38cm",
    description: "Floating under-tier shelf with exposed through-tenon joint pins and hand-wax finish.",
    link: "/products/kaveri-coffee-table",
    tagline: "Low-profile centerpiece with dual-tier storage for art books and ceramics.",
    leadTime: "In Stock — 48hr Bangalore Delivery",
    gallery: [
      {
        src: "/images/stitch_screen_7a4f3197cdd546acae59563d24b1dc02.png",
        alt: "Kaveri Coffee Table in solid Indian Rosewood",
        title: "Studio Angle",
      },
      {
        src: "/images/stitch_screen_237f1c60dc03452ba8e1e49e64d1e647.png",
        alt: "Low-slung living room table",
        title: "Proportions & Undershelf",
      },
      {
        src: "/images/img_024_stitch.png",
        alt: "Coffee table styled with ceramics and magazines",
        title: "Living Room Ambiance",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 46000,
        desc: "Dramatic swirling heartwood grain with warm burgundy luster.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 43000,
        desc: "Calm golden hue with silky hand-rubbed wax finish.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 39500,
        desc: "Minimalist pale olive teak planks showing exposed joinery pins.",
      },
    ],
    features: [
      "Exposed mortise and tenon through-joints pegged with contrasting timber",
      "Lower slatted timber magazine shelf providing open visual airiness",
      "Softened radius corners preventing accidental bumps in living areas",
    ],
    specs: [
      { label: "Length", value: "130 cm (51.2 inches)" },
      { label: "Width", value: "70 cm (27.5 inches)" },
      { label: "Height", value: "38 cm (15.0 inches)" },
      { label: "Lower Clearance", value: "14 cm under-tier shelf" },
      { label: "Weight", value: "29 kg solid heartwood" },
      { label: "Finish", value: "Hand-rubbed natural beeswax" },
    ],
  },
  {
    id: "assam-platform-bed",
    name: "Assam Floating Platform Bed",
    category: "Bedroom",
    timber: "Assam Teak",
    price: 96000,
    image: "/images/stitch_screen_b675956f7c6d401fb8ca491a37683d86.png",
    dimensions: "King Size (L 210cm × W 195cm × H 90cm)",
    description: "Japandi low-profile frame with integrated cane rattan headboard and concealed cantilevers.",
    isPopular: true,
    link: "/products/assam-platform-bed",
    tagline: "Low gravity architectural platform creating serene sleeping sanctuaries.",
    leadTime: "Built to Order — 12 to 16 Days",
    gallery: [
      {
        src: "/images/stitch_screen_b675956f7c6d401fb8ca491a37683d86.png",
        alt: "Assam Floating Platform Bed in solid Assam Teak with woven cane headboard",
        title: "Platform & Rattan Headboard",
      },
      {
        src: "/images/img_026_stitch.png",
        alt: "Sanctuary bedroom styling with platform bed",
        title: "Bedroom Setting",
      },
      {
        src: "/images/stitch_screen_5176c23da1f34decb0b0abd6d0e8bcfb.png",
        alt: "Wood joinery and floating base detail",
        title: "Floating Cantilever Base",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 112000,
        desc: "Noble dark rosewood frame providing regal contrast with rattan headboard.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 104000,
        desc: "Rich honey amber with high natural protective resins.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 96000,
        desc: "Calm, blonde-olive teak timber with uniform tight grain structure.",
      },
    ],
    features: [
      "Concealed inset cantilever legs giving the illusion of a weightlessly floating bed",
      "Hand-stretched natural rattan cane headboard with gentle 8-degree recline",
      "Solid timber slat mattress foundation engineered for optimal airflow",
      "Wide perimeter ledge providing integrated bedside holding areas",
    ],
    specs: [
      { label: "Mattress Size", value: "King (180 × 200 cm standard)" },
      { label: "Overall Length", value: "210 cm (82.7 inches)" },
      { label: "Overall Width", value: "195 cm (76.8 inches)" },
      { label: "Platform Height", value: "28 cm (Low Japandi stance)" },
      { label: "Headboard Height", value: "90 cm (35.4 inches)" },
      { label: "Weight", value: "85 kg solid hardwood" },
    ],
  },
  {
    id: "penthouse-coffee-table",
    name: "Bellandur Penthouse Low Table",
    category: "Living",
    timber: "Hunsur Teak",
    price: 52000,
    image: "/images/stitch_screen_237f1c60dc03452ba8e1e49e64d1e647.png",
    dimensions: "L 140cm × W 80cm × H 36cm",
    description: "Oversized solid slab table featured in Architectural Digest India residential installation.",
    link: "/products/penthouse-coffee-table",
    tagline: "Architectural monolithic geometry anchored with solid cylindrical legs.",
    leadTime: "In Stock — 48hr Bangalore Delivery",
    gallery: [
      {
        src: "/images/stitch_screen_237f1c60dc03452ba8e1e49e64d1e647.png",
        alt: "Bellandur Penthouse Low Table in Hunsur Teak",
        title: "Perspective View",
      },
      {
        src: "/images/stitch_screen_7a4f3197cdd546acae59563d24b1dc02.png",
        alt: "Top grain inspection of teak slab",
        title: "Solid Slab Grain",
      },
      {
        src: "/images/img_024_stitch.png",
        alt: "In living room setting with sunlight",
        title: "Architectural Interior",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 58000,
        desc: "Deep chocolate heartwood with rich organic streaks.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 52000,
        desc: "Warm honey timber seasoned to perfection.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 47500,
        desc: "Silky olive teak slab with natural chatoyancy.",
      },
    ],
    features: [
      "Monolithic 40mm thick solid slab top",
      "Sturdy 120mm diameter turned cylindrical legs with heavy mortise pockets",
      "Micro-beveled perimeter edge crafted by master carvers",
    ],
    specs: [
      { label: "Length", value: "140 cm (55.1 inches)" },
      { label: "Width", value: "80 cm (31.5 inches)" },
      { label: "Height", value: "36 cm (14.2 inches)" },
      { label: "Weight", value: "36 kg" },
      { label: "Finish", value: "Non-toxic organic plant oil & beeswax" },
    ],
  },
  {
    id: "teak-armchair-cane",
    name: "Cubbon Rattan Lounger Armchair",
    category: "Living",
    timber: "Hunsur Teak",
    price: 34000,
    image: "/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png",
    dimensions: "W 68cm × D 72cm × H 75cm",
    description: "Relaxed recline posture with woven side panels and organic cotton cushioned seat.",
    link: "/products/teak-armchair-cane",
    tagline: "Comfortable recline angles with breathable woven wicker sides.",
    leadTime: "In Stock — 48hr Bangalore Delivery",
    gallery: [
      {
        src: "/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png",
        alt: "Cubbon Rattan Lounger Armchair in Hunsur Teak",
        title: "Front Angle Studio",
      },
      {
        src: "/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png",
        alt: "Chair profile showing armrest curve",
        title: "Curved Armrest Detail",
      },
      {
        src: "/images/img_024_stitch.png",
        alt: "Armchair next to sunlit window",
        title: "Reading Nook Placement",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 37000,
        desc: "Rich dark tone with subtle amber undertones.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 34000,
        desc: "Resilient golden teak with natural organic oils.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 31500,
        desc: "Tranquil pale olive frame matching light natural cotton upholstery.",
      },
    ],
    features: [
      "Ergonomically tuned 105-degree recline for reading and afternoon relaxation",
      "Hand-woven Calamus rotang panels across flanking armrest sides",
      "High-density natural latex cushion upholstered in organic washed linen",
    ],
    specs: [
      { label: "Width", value: "68 cm (26.8 inches)" },
      { label: "Depth", value: "72 cm (28.3 inches)" },
      { label: "Height", value: "75 cm (29.5 inches)" },
      { label: "Seat Height", value: "40 cm with cushion" },
      { label: "Weight", value: "11.5 kg" },
      { label: "Upholstery", value: "100% Organic Unbleached Cotton Linen" },
    ],
  },
  {
    id: "atelier-credenza-alt",
    name: "Indiranagar Fluted Console",
    category: "Storage",
    timber: "Hunsur Teak",
    price: 68000,
    image: "/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png",
    dimensions: "L 160cm × D 42cm × H 75cm",
    description: "Narrow hallway and living console with twin sliding tambour cabinets.",
    link: "/products/atelier-credenza-alt",
    tagline: "Compact architectural console designed for Bengaluru entryways and foyer niches.",
    leadTime: "In Stock — 48hr Bangalore Delivery",
    gallery: [
      {
        src: "/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png",
        alt: "Indiranagar Fluted Console in Hunsur Teak",
        title: "Front View",
      },
      {
        src: "/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png",
        alt: "Tambour cabinet fluting detail",
        title: "Tambour Texture",
      },
      {
        src: "/images/img_027_stitch.png",
        alt: "Console in hallway setting",
        title: "Entryway Placement",
      },
    ],
    timbers: [
      {
        id: "rosewood",
        name: "Indian Rosewood",
        provenance: "Malabar / Western Ghats",
        swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
        price: 74000,
        desc: "Bold violet-chocolate heartwood grain.",
      },
      {
        id: "teak",
        name: "Hunsur Teak",
        provenance: "Mysore / Karnataka",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        price: 68000,
        desc: "Smooth hand-planed teak with silky beeswax protection.",
      },
      {
        id: "assam",
        name: "Assam Teak",
        provenance: "North-East Foothills",
        swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
        price: 63000,
        desc: "Warm olive-toned timber featuring fine fluted tambour texture.",
      },
    ],
    features: [
      "Slim 42cm depth specifically calculated for urban apartments and wide corridors",
      "Twin smooth-gliding tambour doors disappearing neatly into side housings",
      "Integrated solid brass leveling glides for marble and tile floors",
    ],
    specs: [
      { label: "Length", value: "160 cm (63.0 inches)" },
      { label: "Depth", value: "42 cm (16.5 inches)" },
      { label: "Height", value: "75 cm (29.5 inches)" },
      { label: "Weight", value: "42 kg solid hardwood" },
      { label: "Finish", value: "Zero-VOC Beeswax & Linseed Oil" },
    ],
  },
];
