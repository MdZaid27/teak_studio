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
  title: siteConfig.fullName,
  description: siteConfig.description,
  keywords: [
    "Solid wood furniture",
    "Hunsur teak dining table",
    "Indian Rosewood chair",
    "Handcrafted heirloom furniture",
    siteConfig.name,
    "Architectural furniture studio",
    "Bespoke solid wood furniture",
  ],
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
