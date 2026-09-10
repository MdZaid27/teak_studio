"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function BespokePage() {
  const [submitted, setSubmitted] = useState(false);

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
            Every home has unique light, specific sightlines, and distinct proportions. We collaborate directly with Bangalore homeowners, architects, and interior designers to craft one-of-a-kind solid wood furniture built to exact millimeter specifications.
          </p>
<div className="flex flex-wrap items-center gap-space-md pt-space-sm w-full sm:w-auto">
<a className="inline-flex items-center justify-center h-12 px-7 bg-primary-container text-on-primary rounded-lg font-title-md text-title-md hover:bg-tertiary-container transition-all duration-150 ease-out active:scale-95 shadow-sm" href="#commission-form">
              Start Your Custom Order
            </a>
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
<div className="font-label-sm text-label-sm text-outline">Bangalore In-Room Setup</div>
</div>
</div>
</div>
{/*  Hero Visual Element  */}
<div className="lg:col-span-6 relative">
<div className="relative overflow-hidden rounded-lg bg-surface-container p-2 border border-outline-variant/40 shadow-xl shadow-primary/5">
<div className="overflow-hidden rounded aspect-[4/3] relative">
<img className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700 ease-out" alt="Bangalore atelier master artisans and senior carpenter sketching full-scale architectural blueprints on a drafting desk while colleagues plane a massive solid timber dining table in an expansive brick workshop filled with warm streaming natural window daylight." src="/images/img_037_stitch.png" />
<div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
</div>
<div className="p-space-md flex justify-between items-center bg-surface-container-low mt-2 rounded">
<div>
<p className="font-title-md text-title-md text-primary">Bangalore Atelier Production Floor</p>
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
              Handled exclusively by our own white-glove team. In-room positioning, felt pad installation, and zero-plastic packaging haul-away across all Bangalore pin codes.
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
<img className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" alt="Editorial design shoot of a bespoke architectural solid teak expandable dining table in an airy modern Bangalore home with warm limestone flooring, clean morning daylight, and minimalist ceramic vases." src="/images/img_038_stitch.png" />
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
<div className="flex items-center gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
<span className="">Hunsur Teak / Deccan Rosewood</span>
<span className="">•</span>
<span className="">Custom seating for 6 to 16 persons</span>
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
<div className="flex items-center gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
<span className="">Acoustic Damped Interior</span>
<span className="">•</span>
<span className="">Integrated Cable Ports</span>
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
<div className="flex items-center gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
<span className="">Steam-Bent Curves</span>
<span className="">•</span>
<span className="">Natural Malabar Cane</span>
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
<div className="flex items-center gap-space-sm text-outline font-label-sm text-label-sm border-t border-outline-variant/30 pt-space-sm">
<span className="">Concealed Cable Passages</span>
<span className="">•</span>
<span className="">Zero-Creak Joinery</span>
</div>
</div>
</div>
</div>
</section>
{/*  SECTION 4: BESPOKE CONSULTATION INQUIRY DRAWER / FORM  */}
<section className="w-full bg-surface-container-low py-space-5xl border-t border-outline-variant/30" id="booking">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="max-w-4xl mx-auto bg-surface rounded-xl border border-outline-variant/40 shadow-xl shadow-primary/5 p-space-xl md:p-space-3xl">
<div className="text-center max-w-xl mx-auto mb-space-2xl">
<span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Architectural Consultation</span>
<h2 className="font-display text-headline-lg text-primary mt-space-2xs">Begin Your Bespoke Commission</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Tell our studio team about your home, your aesthetic vision, and your dimensional framework. We reply within 24 hours with feasibility notes and wood suggestions.
            </p>
</div>
<form className="space-y-space-xl" id="bespokeForm" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
{/*  Step 1: Category Selection  */}
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-xs tracking-wider">
                1. Select Furniture Typology
              </label>
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-xs">
<label className="cursor-pointer">
<input defaultChecked className="peer sr-only" name="furniture_category" type="radio" value="dining" />
<div className="h-12 flex items-center justify-center text-center px-3 border border-outline-variant/40 rounded bg-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary font-body-sm text-body-sm transition-all duration-150">
                    Dining Table
                  </div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="furniture_category" type="radio" value="storage" />
<div className="h-12 flex items-center justify-center text-center px-3 border border-outline-variant/40 rounded bg-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary font-body-sm text-body-sm transition-all duration-150">
                    Credenza / Storage
                  </div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="furniture_category" type="radio" value="seating" />
<div className="h-12 flex items-center justify-center text-center px-3 border border-outline-variant/40 rounded bg-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary font-body-sm text-body-sm transition-all duration-150">
                    Seating / Chairs
                  </div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="furniture_category" type="radio" value="bed" />
<div className="h-12 flex items-center justify-center text-center px-3 border border-outline-variant/40 rounded bg-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary font-body-sm text-body-sm transition-all duration-150">
                    Platform Bed
                  </div>
</label>
<label className="cursor-pointer col-span-2 sm:col-span-1">
<input className="peer sr-only" name="furniture_category" type="radio" value="full" />
<div className="h-12 flex items-center justify-center text-center px-3 border border-outline-variant/40 rounded bg-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary font-body-sm text-body-sm transition-all duration-150">
                    Full Residence
                  </div>
</label>
</div>
</div>
{/*  Step 2: Preferred Timber  */}
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-xs tracking-wider">
                2. Preferred Timber Species
              </label>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
<label className="cursor-pointer">
<input defaultChecked className="peer sr-only" name="wood_preference" type="radio" value="hunsur" />
<div className="p-3 border border-outline-variant/40 rounded bg-surface peer-checked:border-primary peer-checked:bg-surface-container transition-all">
<div className="font-title-md text-title-md text-primary">Hunsur Teak</div>
<div className="text-outline text-label-sm font-label-sm">Golden Amber, Dense Grain</div>
</div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="wood_preference" type="radio" value="rosewood" />
<div className="p-3 border border-outline-variant/40 rounded bg-surface peer-checked:border-primary peer-checked:bg-surface-container transition-all">
<div className="font-title-md text-title-md text-primary">Indian Rosewood</div>
<div className="text-outline text-label-sm font-label-sm">Deep Espresso, High Lustre</div>
</div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="wood_preference" type="radio" value="assam" />
<div className="p-3 border border-outline-variant/40 rounded bg-surface peer-checked:border-primary peer-checked:bg-surface-container transition-all">
<div className="font-title-md text-title-md text-primary">Assam Teak</div>
<div className="text-outline text-label-sm font-label-sm">Light Honey, Linear Figure</div>
</div>
</label>
<label className="cursor-pointer">
<input className="peer sr-only" name="wood_preference" type="radio" value="recommend" />
<div className="p-3 border border-outline-variant/40 rounded bg-surface peer-checked:border-primary peer-checked:bg-surface-container transition-all">
<div className="font-title-md text-title-md text-primary">Recommend Based on Space</div>
<div className="text-outline text-label-sm font-label-sm">Studio Consultation</div>
</div>
</label>
</div>
</div>
{/*  Step 3: Dimensions and Brief Notes  */}
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider" htmlFor="dimensions">
                3. Approximate Dimensions &amp; Spatial Context
              </label>
<textarea className="w-full bg-surface border border-outline-variant/50 rounded-lg p-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0 placeholder:text-outline/60 transition-colors" id="dimensions" placeholder="E.g., 8-seater dining table, approx 240cm x 100cm, for Bellandur apartment with direct western sunlight and beige travertine floors." required rows={3}></textarea>
</div>
{/*  Step 4: Contact & Bangalore Pin Details  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">Full Name</label>
<input className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0" placeholder="e.g. Vikramaditya Rao" required type="text" />
</div>
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">Phone / WhatsApp</label>
<input className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0" placeholder="+91 98450 00000" required type="tel" />
</div>
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">Email Address</label>
<input className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0" placeholder="vikram@designstudio.in" required type="email" />
</div>
<div>
<label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">Bangalore Area / Pincode</label>
<input className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0" placeholder="e.g. Indiranagar, 560038" required type="text" />
</div>
</div>
{/*  File Upload Prompt  */}
<div className="p-space-lg border border-dashed border-outline-variant rounded-lg bg-surface-container-low text-center hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-outline text-3xl mb-2">cloud_upload</span>
<p className="font-title-md text-title-md text-primary">Upload architectural floor plan or sketch</p>
<p className="font-body-sm text-body-sm text-outline mt-1">Accepts PDF, DWG, JPG, or PNG (up to 25MB)</p>
<input className="hidden" id="fileUpload" type="file" />
<label className="inline-block mt-space-sm font-label-caps text-label-caps uppercase px-4 py-2 bg-surface border border-outline-variant/60 rounded cursor-pointer hover:border-primary transition-colors" htmlFor="fileUpload">
                Browse CAD / Files
              </label>
</div>
{/*  Submission Actions  */}
<div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-outline-variant/30">
<button className="w-full sm:w-auto h-12 px-8 bg-primary text-surface rounded-lg font-title-md text-title-md hover:bg-tertiary-container transition-all active:scale-95" type="submit">
                Start Your Custom Order
              </button>
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 border border-primary text-primary rounded-full font-title-md text-title-md hover:bg-primary hover:text-surface transition-all active:scale-95" href="https://wa.me/918041238900" rel="noopener" target="_blank">
<span className="material-symbols-outlined text-lg">chat</span>
                Talk to Us on WhatsApp (+91 80 4123 8900)
              </a>
</div>
{/*  Feedback Alert state  */}
<div className="hidden p-space-md bg-secondary-fixed text-on-secondary-fixed rounded-lg text-center font-title-md" id="successToast">
              Thank you. Our Bangalore furniture architects will review your project brief and connect within 24 hours.
            </div>
</form>
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
              We operate as a dedicated manufacturing partner to Bangalore’s premier interior architecture practices and independent designers. We eliminate execution risk with verified joinery standards, transparent workshop access, and predictable timelines.
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

    </div>
  );
}
