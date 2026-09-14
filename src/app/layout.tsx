import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";
import CompleteProfileModal from "@/components/auth/CompleteProfileModal";
import { siteConfig } from "@/config/site";

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://teakhaus.in"),
  title: {
    default: "TEAK HAUS — Heirloom Solid Hardwood Furniture Atelier",
    template: "%s | TEAK HAUS",
  },
  description: "Bespoke solid hardwood dining tables, chairs, credenzas, and platform beds handcrafted in old-growth Hunsur Teak and Malabar Rosewood.",
  keywords: [
    "Solid wood furniture",
    "Hunsur teak dining table",
    "Indian Rosewood furniture",
    "Handcrafted heirloom furniture Bangalore",
    "Bespoke solid wood furniture",
    "TEAK HAUS",
    "Architectural timber studio",
    "Mortise and tenon joinery table",
  ],
  authors: [{ name: "TEAK HAUS Master Joiners" }],
  creator: "TEAK HAUS",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://teakhaus.in",
    siteName: "TEAK HAUS",
    title: "TEAK HAUS — Heirloom Solid Hardwood Furniture Atelier",
    description: "Monolithic solid timber tables, bespoke architectural credenzas, and handcrafted furniture built to outlive generations.",
    images: [
      {
        url: "/images/img_039_stitch.png",
        width: 1200,
        height: 630,
        alt: "TEAK HAUS Solid Hardwood Joinery Atelier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEAK HAUS — Solid Hardwood Furniture Atelier",
    description: "Heirloom dining tables and bespoke architectural joinery handcrafted in old-growth Indian heartwood.",
    images: ["/images/img_039_stitch.png"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/brand/teak-haus-light.png" },
      { url: "/brand/teak-haus-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://teakhaus.in/#organization",
      "name": "TEAK HAUS",
      "url": "https://teakhaus.in",
      "logo": "https://teakhaus.in/brand/teak-haus-dark.png",
      "sameAs": [
        "https://www.instagram.com/teakhaus",
        "https://www.pinterest.com/teakhaus"
      ],
      "description": "Solid hardwood atelier specializing in heirloom dining tables, architectural joinery, and bespoke commissions in Bangalore, India."
    },
    {
      "@type": "HomeGoodsStore",
      "@id": "https://teakhaus.in/#indiranagar-atelier",
      "name": "TEAK HAUS — Indiranagar Flagship Atelier",
      "image": "https://teakhaus.in/images/img_039_stitch.png",
      "telephone": "+918041238900",
      "priceRange": "₹₹₹₹",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "100ft Road, Defence Colony, Indiranagar",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560038",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 12.9784,
        "longitude": 77.6408
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "11:00",
          "closes": "20:00"
        }
      ]
    },
    {
      "@type": "HomeGoodsStore",
      "@id": "https://teakhaus.in/#whitefield-studio",
      "name": "TEAK HAUS — VR Whitefield Studio",
      "image": "https://teakhaus.in/images/img_039_stitch.png",
      "telephone": "+918041238900",
      "priceRange": "₹₹₹₹",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Whitefield Main Road, Devasandra Industrial Estate",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560066",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 12.9961,
        "longitude": 77.7126
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "11:00",
          "closes": "20:00"
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} scroll-smooth antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#FAF9F6] text-[#1A1A1A] min-h-screen flex flex-col selection:bg-[#feb383] selection:text-[#311300]">
        <CustomerAuthProvider>
          <CartProvider>
            <AnnouncementBar />
            <Navbar />
            <CartDrawer />
            <CustomerAuthModal />
            <CompleteProfileModal />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
