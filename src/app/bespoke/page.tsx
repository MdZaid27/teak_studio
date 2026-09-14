"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { StudioBookingModal } from "@/components/StudioBookingModal";
import { BespokeInquiryModal } from "@/components/modals/BespokeInquiryModal";
import BespokeInquiryForm from "@/components/bespoke/BespokeInquiryForm";

export default function BespokePage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLocation, setBookingLocation] = useState("Indiranagar Flagship Atelier");

  // Bespoke Inquiry Modal state
  const [isBespokeInquiryOpen, setIsBespokeInquiryOpen] = useState(false);
  const [selectedBespokeType, setSelectedBespokeType] = useState("Custom Dining Statement");
  const [selectedBespokeTimber, setSelectedBespokeTimber] = useState("Hunsur Teak");

  const openBespokeModal = (type: string, timber: string = "Hunsur Teak") => {
    setSelectedBespokeType(type);
    setSelectedBespokeTimber(timber);
    setIsBespokeInquiryOpen(true);
  };

  return (
    <div className="w-full overflow-hidden">
      
{/*  SECTION 1: HERO  */}
<section className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop pt-space-3xl pb-space-4xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
{/*  Hero Copy & Narrative  */}
<div className="lg:col-span-6 flex flex-col items-start space-y-space-lg">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container text-secondary rounded-full">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-on-secondary-fixed-variant">Bespoke Architectural Commissions</span>
</div>
<h1 className="font-display text-display-mobile md:text-display text-primary leading-none">
            Furniture Made for Your Space.
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl font-normal leading-relaxed">
            Every home has unique light, specific sightlines, and distinct proportions. We collaborate directly with homeowners, architects, and interior designers to craft one-of-a-kind solid wood furniture built to exact millimeter specifications.
          </p>
<div className="flex flex-wrap items-center gap-space-md pt-space-sm w-full sm:w-auto">
<button
  type="button"
  onClick={() => openBespokeModal("Custom Dining Statement", "Hunsur Teak")}
  className="inline-flex items-center justify-center h-12 px-7 bg-primary-container text-on-primary rounded-lg font-title-md text-title-md hover:bg-tertiary-container transition-all duration-150 ease-out active:scale-95 shadow-sm cursor-pointer"
>
  Start Your Custom Order
</button>
<a className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-primary text-primary rounded-full font-title-md text-title-md hover:bg-primary hover:text-surface transition-all duration-150 active:scale-95" href="https://wa.me/918041238900" rel="noopener" target="_blank">
<span className="material-symbols-outlined text-lg">chat</span>
  Talk to Us on WhatsApp
</a>
</div>
{/*  Micro proof-points  */}
<div className="pt-space-md grid grid-cols-3 gap-space-lg border-t border-outline-variant/30 w-full mt-space-md">
<div>
<div className="font-display text-headline-sm text-primary">100%</div>
<div className="font-label-sm text-label-sm text-outline">Solid Single-Source Timber</div>
</div>
<div>
<div className="font-display text-headline-sm text-primary">±1mm</div>
<div className="font-label-sm text-label-sm text-outline">Millimeter CAD Precision</div>
</div>
<div>
<div className="font-display text-headline-sm text-primary">White Glove</div>
<div className="font-label-sm text-label-sm text-outline">Atelier In-Room Setup</div>
</div>
</div>
</div>
{/*  Hero Visual Element  */}
<div className="lg:col-span-6 relative">
<div className="relative overflow-hidden rounded-lg bg-surface-container p-2 border border-outline-variant/40 shadow-xl shadow-primary/5">
<div className="overflow-hidden rounded aspect-[4/3] relative">
<img className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700 ease-out" alt="Atelier master artisans and senior carpenter sketching full-scale architectural blueprints on a drafting desk while colleagues plane a massive solid timber dining table in an expansive brick workshop filled with warm streaming natural window daylight." src="/images/img_037_stitch.png" />
<div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
</div>
<div className="p-space-md flex justify-between items-center bg-surface-container-low mt-2 rounded">
<div>
<p className="font-title-md text-title-md text-primary">Atelier Joinery Production Floor</p>
<p className="font-body-sm text-body-sm text-outline">Live commission in raw Malabar Teak &amp; hand-planed jointing</p>
</div>
<span className="px-2.5 py-1 bg-surface rounded text-primary text-label-caps font-label-caps uppercase border border-outline-variant/40">Atelier Studio</span>
</div>
</div>
</div>
</div>
</section>
{/*  SECTION 2: THE 5-STEP CUSTOM COMMISSION PROCESS  */}
<section className="w-full bg-surface-container-low border-y border-outline-variant/30 py-space-4xl">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-3xl">
<div className="max-w-2xl">
<div className="font-label-caps text-label-caps uppercase text-secondary tracking-widest mb-space-2xs">Methodology &amp; Rigor</div>
<h2 className="font-display text-headline-lg text-primary">The 5-Step Custom Commission Process</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              From raw architectural drawings to hand-oiled heirloom placement, our deliberate lifecycle eliminates guesswork and guarantees generational longevity.
            </p>
</div>
<div className="mt-space-md md:mt-0">
<span className="font-body-sm text-body-sm text-outline">Average Timeline: 4 to 7 Weeks</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-5 gap-space-lg relative">
{/*  Step 01  */}
<div className="flex flex-col bg-surface p-space-lg rounded-lg border border-outline-variant/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5">
<div className="flex justify-between items-baseline mb-space-md">
<span className="font-display text-headline-md text-secondary font-medium">01</span>
<span className="material-symbols-outlined text-outline text-xl">upload_file</span>
</div>
<h3 className="font-title-lg text-title-lg text-primary mb-space-xs">Share your requirements</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Upload floorplans, sketches, moodboards, or dimensional limits. Tell us about your room&apos;s natural light, seating needs, and lifestyle.
            </p>
</div>
{/*  Step 02  */}
<div className="flex flex-col bg-surface p-space-lg rounded-lg border border-outline-variant/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5">
<div className="flex justify-between items-baseline mb-space-md">
<span className="font-display text-headline-md text-secondary font-medium">02</span>
<span className="material-symbols-outlined text-outline text-xl">architecture</span>
</div>
<h3 className="font-title-lg text-title-lg text-primary mb-space-xs">Discuss design &amp; dimensions</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Meet our furniture architects in Indiranagar, Whitefield, or via virtual video consultation. We refine proportions, draft CAD blueprints, and review clearance margins.
            </p>
</div>
{/*  Step 03  */}
<div className="flex flex-col bg-surface p-space-lg rounded-lg border border-outline-variant/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5">
<div className="flex justify-between items-baseline mb-space-md">
<span className="font-display text-headline-md text-secondary font-medium">03</span>
<span className="material-symbols-outlined text-outline text-xl">palette</span>
</div>
<h3 className="font-title-lg text-title-lg text-primary mb-space-xs">Select wood and finish</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Choose between Karnataka Hunsur Teak, Deccan Rosewood, or Assam Teak. Select tactile plant-oil or beeswax finish tones tailored to your floor and light.
            </p>
</div>
{/*  Step 04  */}
<div className="flex flex-col bg-surface p-space-lg rounded-lg border border-outline-variant/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5">
<div className="flex justify-between items-baseline mb-space-md">
<span className="font-display text-headline-md text-secondary font-medium">04</span>
<span className="material-symbols-outlined text-outline text-xl">handyman</span>
</div>
<h3 className="font-title-lg text-title-lg text-primary mb-space-xs">Craft your furniture</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Your commission is hand-built by dedicated master karigars in our workshop. Receive milestone photo updates showing rough-sawn timber selection, joinery cutting, and hand-waxing.
            </p>
</div>
{/*  Step 05  */}
<div className="flex flex-col bg-surface p-space-lg rounded-lg border border-outline-variant/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5">
<div className="flex justify-between items-baseline mb-space-md">
<span className="font-display text-headline-md text-secondary font-medium">05</span>
<span className="material-symbols-outlined text-outline text-xl">local_shipping</span>
</div>
<h3 className="font-title-lg text-title-lg text-primary mb-space-xs">Delivery &amp; installation</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Handled exclusively by our own white-glove team. In-room positioning, felt pad installation, and zero-plastic packaging haul-away included.
            </p>
</div>
</div>
</div>
</section>
{/*  SECTION 3: CUSTOM CAPABILITIES & PORTFOLIO SHOWCASE  */}
<section className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop py-space-5xl">
<div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-3xl">
<div className="font-label-caps text-label-caps uppercase text-secondary tracking-widest mb-space-2xs">Atelier Typologies</div>
<h2 className="font-display text-headline-lg text-primary">Custom Capabilities &amp; Commission Showcase</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Each commission is dimensionally engineered to balance functional modern living with the unyielding permanence of hand-mortised joinery.
        </p>
</div>
{/*  Bento-style Asymmetric Showcase Grid  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-xl">
{/*  Showcase 1: Architectural Dining Tables  */}
<div className="md:col-span-7 bg-surface-container-low rounded-lg p-space-lg border border-outline-variant/30 flex flex-col justify-between group">
<div className="overflow-hidden rounded-lg aspect-[16/10] bg-surface relative mb-space-md">
<img className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" alt="Editorial design shoot of a bespoke architectural solid teak expandable dining table in an airy modern residence with warm limestone flooring, clean morning daylight, and minimalist ceramic vases." src="/images/img_038_stitch.png" />
<span className="absolute top-space-md left-space-md px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-sm rounded font-label-caps text-label-caps uppercase text-primary border border-outline-variant/40">
              Heritage Spec
            </span>
</div>
<div>
<div className="flex justify-between items-baseline mb-space-2xs">
<h3 className="font-display text-headline-sm text-primary">Architectural Dining Tables</h3>
<span className="font-title-md text-title-md text-secondary">From ₹1,40,000</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
              Single-slab tops up to 14 feet, hidden butterfly leaf extensions, and integrated wire channels for work-dining hybrids. Hand-planed edge profiles and mortise-and-tenon structural undercarriages.
            </p>
<div className="flex items-center justify-between gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
  <span>Hunsur Teak / Deccan Rosewood • 6 to 16 seats</span>
  <button
    type="button"
    onClick={() => openBespokeModal("Custom Dining Statement", "Hunsur Teak")}
    className="text-secondary hover:text-primary font-semibold text-xs tracking-wider uppercase flex items-center gap-1 cursor-pointer"
  >
    Commission Table &rarr;
  </button>
</div>
</div>
</div>
{/*  Showcase 2: Fluted & Tambour Credenzas  */}
<div className="md:col-span-5 bg-surface-container-low rounded-lg p-space-lg border border-outline-variant/30 flex flex-col justify-between group">
<div className="overflow-hidden rounded-lg aspect-square bg-surface relative mb-space-md">
<img alt="Solid Hunsur Teak credenza with fluted wood sliding doors" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" src="/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png" />
<span className="absolute top-space-md left-space-md px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-sm rounded font-label-caps text-label-caps uppercase text-primary border border-outline-variant/40">
              Solid Hunsur Teak
            </span>
</div>
<div>
<div className="flex justify-between items-baseline mb-space-2xs">
<h3 className="font-display text-headline-sm text-primary">Fluted &amp; Tambour Credenzas</h3>
<span className="font-title-md text-title-md text-secondary">From ₹95,000</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
              Precision milled timber slats, smooth glide tambour tracks, custom acoustics for vinyl record storage, vented media component bays, and solid milled brass hardware.
            </p>
<div className="flex items-center justify-between gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
  <span>Integrated Cable Ports</span>
  <button
    type="button"
    onClick={() => openBespokeModal("Architectural Joinery", "Hunsur Teak")}
    className="text-secondary hover:text-primary font-semibold text-xs tracking-wider uppercase flex items-center gap-1 cursor-pointer"
  >
    Commission Credenza &rarr;
  </button>
</div>
</div>
</div>
{/*  Showcase 3: Sculptural Seating & Benches  */}
<div className="md:col-span-5 bg-surface-container-low rounded-lg p-space-lg border border-outline-variant/30 flex flex-col justify-between group">
<div className="overflow-hidden rounded-lg aspect-square bg-surface relative mb-space-md">
<img alt="Handcrafted solid Indian Rosewood dining chair with curved cane rattan backrest" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" src="/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png" />
<span className="absolute top-space-md left-space-md px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-sm rounded font-label-caps text-label-caps uppercase text-primary border border-outline-variant/40">
              Deccan Rosewood
            </span>
</div>
<div>
<div className="flex justify-between items-baseline mb-space-2xs">
<h3 className="font-display text-headline-sm text-primary">Sculptural Seating &amp; Benches</h3>
<span className="font-title-md text-title-md text-secondary">From ₹32,000</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
              Ergonomic steam-bent lumbar rails, hand-woven Malabar cane octagonal webbing, and upholstery in organic Belgian linen or handloomed Indian textured cottons.
            </p>
<div className="flex items-center justify-between gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
  <span>Natural Malabar Cane</span>
  <button
    type="button"
    onClick={() => openBespokeModal("Architectural Joinery", "Malabar Rosewood")}
    className="text-secondary hover:text-primary font-semibold text-xs tracking-wider uppercase flex items-center gap-1 cursor-pointer"
  >
    Commission Seating &rarr;
  </button>
</div>
</div>
</div>
{/*  Showcase 4: Platform Bed & Headboard Suites  */}
<div className="md:col-span-7 bg-surface-container-low rounded-lg p-space-lg border border-outline-variant/30 flex flex-col justify-between group">
<div className="overflow-hidden rounded-lg aspect-[16/10] bg-surface relative mb-space-md">
<img alt="Solid Assam Teak floating platform bed with woven cane headboard" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" src="/images/stitch_screen_b675956f7c6d401fb8ca491a37683d86.png" />
<span className="absolute top-space-md left-space-md px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-sm rounded font-label-caps text-label-caps uppercase text-primary border border-outline-variant/40">
              Assam Teak Suite
            </span>
</div>
<div>
<div className="flex justify-between items-baseline mb-space-2xs">
<h3 className="font-display text-headline-sm text-primary">Platform Bed &amp; Headboard Suites</h3>
<span className="font-title-md text-title-md text-secondary">From ₹1,65,000</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
              Floating nightstand cantilever modules, integrated soft ambient warm-LED floor wash channels, acoustic cane headboards, and solid slatted mattress suspension systems.
            </p>
<div className="flex items-center justify-between gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
  <span>Zero-Creak Joinery</span>
  <button
    type="button"
    onClick={() => openBespokeModal("Residential Residence", "Assam Teak")}
    className="text-secondary hover:text-primary font-semibold text-xs tracking-wider uppercase flex items-center gap-1 cursor-pointer"
  >
    Commission Bed Suite &rarr;
  </button>
</div>
</div>
</div>
</div>
</section>
{/*  SECTION 4: BESPOKE CONSULTATION INQUIRY DRAWER / FORM  */}
<section className="w-full bg-surface-container-low py-space-5xl border-t border-outline-variant/30" id="commission-form">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop" id="booking">
<div className="max-w-4xl mx-auto bg-surface rounded-xl border border-outline-variant/40 shadow-xl shadow-primary/5 p-space-xl md:p-space-3xl">
<div className="text-center max-w-xl mx-auto mb-space-2xl">
<span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Architectural Consultation</span>
<h2 className="font-display text-headline-lg text-primary mt-space-2xs">Begin Your Bespoke Commission</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Tell our studio team about your home, your aesthetic vision, and your dimensional framework. We reply within 24 hours with feasibility notes and wood suggestions.
            </p>
</div>

      <BespokeInquiryForm />
</div>
</div>
</section>
{/*  SECTION 5: ARCHITECTURAL TRADE & DESIGNER SUPPORT  */}
<section className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop py-space-5xl">
<div className="bg-surface-container rounded-xl p-space-xl md:p-space-3xl border border-outline-variant/30">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
<div className="lg:col-span-6 space-y-space-md">
<span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Trade Ecosystem</span>
<h2 className="font-display text-headline-lg text-primary leading-tight">
              Architectural Trade &amp; Designer Support
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              We operate as a dedicated manufacturing partner to premier interior architecture practices and independent designers. We eliminate execution risk with verified joinery standards, transparent workshop access, and predictable timelines.
            </p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary text-2xl mt-0.5">view_in_ar</span>
<div>
<h3 className="font-title-md text-title-md text-primary">3D BIM &amp; Revit Assets</h3>
<p className="font-body-sm text-body-sm text-outline">Ready-to-drop models for interior renders and layout clearance.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary text-2xl mt-0.5">inventory_2</span>
<div>
<h3 className="font-title-md text-title-md text-primary">24h Finish Sample Box</h3>
<p className="font-body-sm text-body-sm text-outline">Hand-delivered timber and organic wax finish samples to your studio.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary text-2xl mt-0.5">loyalty</span>
<div>
<h3 className="font-title-md text-title-md text-primary">Trade Tier Pricing</h3>
<p className="font-body-sm text-body-sm text-outline">Transparent baseline pricing structures tailored to multi-room projects.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary text-2xl mt-0.5">apartment</span>
<div>
<h3 className="font-title-md text-title-md text-primary">Client Atelier Walkthroughs</h3>
<p className="font-body-sm text-body-sm text-outline">Host your design clients at our Indiranagar workshop for timber selection.</p>
</div>
</div>
</div>
<div className="pt-space-md">
<a className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-wider text-primary border-b-2 border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors" href="#commission-form">
                Register as an Architectural Partner →
              </a>
</div>
</div>
{/*  Visual Atelier Inspection Detail  */}
<div className="lg:col-span-6">
<div className="relative rounded-lg overflow-hidden border border-outline-variant/40 bg-surface shadow-md">
<img className="w-full aspect-[4/3] object-cover" alt="Macro architectural detail photography of a custom handcrafted teak and dark rosewood dovetail joinery corner joint with exposed end-grain on a bespoke workshop table under soft diffused studio lighting." src="/images/img_039_stitch.png" />
<div className="p-space-md bg-surface-container-low flex justify-between items-center">
<div>
<span className="font-label-caps text-label-caps uppercase text-secondary">Joinery Standard</span>
<p className="font-title-md text-title-md text-primary">Dovetail &amp; Mortise Verification</p>
</div>
<span className="text-outline font-label-sm text-label-sm">Tolerance: ±0.5mm</span>
</div>
</div>
</div>
</div>
</div>
</section>

{/* SECTION 6: PRIVATE ATELIER WALKTHROUGH BOOKING (#booking) */}
<section id="booking" className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop py-space-4xl border-t border-outline-variant/30">
  <div className="bg-[#161514] text-[#FAF9F6] rounded-2xl p-8 sm:p-12 border border-[#2A2724] relative overflow-hidden">
    <div className="max-w-3xl space-y-4">
      <span className="font-mono text-xs text-[#D4A373] uppercase tracking-widest block">
        Private Atelier Visits
      </span>
      <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF9F6] font-medium leading-tight">
        Experience Raw Slabs &amp; Heirloom Joinery in Person
      </h2>
      <p className="text-sm sm:text-base text-[#9B9287] leading-relaxed">
        Step inside our Bangalore flagship studios. Inspect live wood seasoning racks, run your hands across hand-pegged mortise joinery, and consult with our master furniture architects over curated pour-over coffee.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-6">
        <div className="p-5 rounded-xl bg-[#1C1A18] border border-[#2A2724] space-y-2">
          <div className="flex items-center gap-2 text-[#D4A373]">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className="font-serif text-base font-medium text-[#FAF9F6]">Indiranagar Flagship Atelier</span>
          </div>
          <p className="text-xs text-[#9B9287]">100ft Road, Defence Colony, Indiranagar, Bengaluru — 560038</p>
          <div className="text-[11px] font-mono text-[#706860]">Tue – Sun: 11:00 AM – 8:00 PM • Valet Parking Available</div>
          <button
            type="button"
            onClick={() => {
              setBookingLocation("Indiranagar Flagship Atelier");
              setIsBookingModalOpen(true);
            }}
            className="mt-2 w-full py-2.5 px-4 rounded-lg bg-[#24211E] hover:bg-[#D4A373] text-[#FAF9F6] hover:text-[#121110] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Schedule Indiranagar Visit →
          </button>
        </div>

        <div className="p-5 rounded-xl bg-[#1C1A18] border border-[#2A2724] space-y-2">
          <div className="flex items-center gap-2 text-[#D4A373]">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className="font-serif text-base font-medium text-[#FAF9F6]">VR Whitefield Studio</span>
          </div>
          <p className="text-xs text-[#9B9287]">Whitefield Main Road, Devasandra Industrial Estate, Bengaluru — 560066</p>
          <div className="text-[11px] font-mono text-[#706860]">Mon – Sun: 11:00 AM – 8:00 PM • Dedicated Patron Lounge</div>
          <button
            type="button"
            onClick={() => {
              setBookingLocation("VR Whitefield Studio");
              setIsBookingModalOpen(true);
            }}
            className="mt-2 w-full py-2.5 px-4 rounded-lg bg-[#24211E] hover:bg-[#D4A373] text-[#FAF9F6] hover:text-[#121110] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Schedule Whitefield Visit →
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Studio Booking Modal */}
<StudioBookingModal
  isOpen={isBookingModalOpen}
  onClose={() => setIsBookingModalOpen(false)}
  defaultLocation={bookingLocation}
/>

{/* Bespoke Architectural Commission Modal */}
<BespokeInquiryModal
  isOpen={isBespokeInquiryOpen}
  onClose={() => setIsBespokeInquiryOpen(false)}
  defaultProjectType={selectedBespokeType}
  defaultTimber={selectedBespokeTimber}
/>

    </div>
  );
}
