/**
 * TEAK HAUS — Centralized Store Configuration & Metadata
 * Facilitates straightforward rebranding and consistent store-level constants.
 */

export const siteConfig = {
  name: "TEAK HAUS",
  tagline: "Solid Hardwood & Heirloom Joinery",
  fullName: "TEAK HAUS — Solid Hardwood Furniture & Heirloom Joinery",
  description:
    "Handcrafted solid wood furniture built with Hunsur Teak, Malabar Rosewood, and Assam Teak. Traditional mortise and tenon interlocking joinery, lifetime structural guarantee.",
  shortDescription: "Architectural solid wood furniture atelier.",
  orderPrefix: "TH-ORD",
  currency: "INR",
  currencySymbol: "₹",
  location: "India",
  phone: "+91 98765 43210",
  email: "concierge@teakhaus.in",
  studios: [
    {
      name: "Indiranagar Atelier",
      address: "100ft Road, Defence Colony, Indiranagar, Bengaluru 560038",
      hours: "Mon – Sun: 11:00 AM – 8:00 PM",
    },
    {
      name: "VR Whitefield Studio",
      address: "Sky Level, VR Bengaluru, Whitefield Main Road, Bengaluru 560048",
      hours: "Mon – Sun: 11:00 AM – 8:00 PM",
    },
    {
      name: "Joinery Workshop",
      address: "Timber Yard Layout, Off Mysore Road, Bengaluru",
      hours: "By Appointment",
    },
  ],
  links: {
    instagram: "https://instagram.com",
    bespoke: "/bespoke",
    shop: "/shop",
    about: "/about",
  },
};

export type SiteConfig = typeof siteConfig;
