import Link from "next/link";
import Image from "next/image";
import StudioCTASection from "@/components/about/StudioCTASection";

export const metadata = {
  title: "Our Story & Craftsmanship — TEAK HAUS",
  description: "The living imperative of genuine solid heartwood. Hand-cut mortise and tenon joinery, master karigars, and timeless furniture heritage.",
};

export default function AboutStoryPage() {
  return (
    <div className="w-full overflow-hidden">
      
{/*  SECTION 1: HERO (EDITORIAL MAGAZINE OPENING)  */}
<section className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop pt-space-3xl md:pt-space-4xl pb-space-4xl">
{/*  Editorial Eyebrow & Headline Cluster  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-2xl items-end mb-space-3xl">
<div className="lg:col-span-8">
<div className="inline-flex items-center gap-space-xs px-2.5 py-1 bg-surface-container-low border border-outline-variant/40 rounded-full mb-space-md">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="font-label-caps text-label-caps tracking-widest uppercase text-on-surface-variant">THE PHILOSOPHY OF TEAK HAUS</span>
</div>
<h1 className="font-display text-display-mobile md:text-display text-primary leading-[1.08] tracking-tight">
            Born from the Forest. <br className="hidden md:inline" />Shaped by Human Hands.
          </h1>
</div>
<div className="lg:col-span-4 border-l border-outline-variant/40 pl-space-lg pb-1">
<p className="font-display italic text-headline-sm text-secondary mb-space-2xs">&ldquo;Trees remember the sun.&rdquo;</p>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            In an era obsessed with transient assembly-line particleboard and chemical binders, we stand resolute in the sanctuary of heritage timber yards.
          </p>
</div>
</div>
{/*  Hero Visual & Editorial Essay Module  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
{/*  Large Editorial Image  */}
<div className="lg:col-span-7">
<div className="relative overflow-hidden rounded-lg bg-surface-container-low border border-outline-variant/30 group">
<img className="w-full h-[480px] md:h-[620px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" alt="A master Indian artisan inside a sunlit woodcraft workshop hand-planing a massive slab of solid Malabar teak with flying wood curls, warm cinematic lighting, natural dust motes in sunbeams, tactile heirloom craftsmanship." src="/images/img_040_stitch.png" />
<div className="absolute bottom-0 inset-x-0 p-space-lg bg-gradient-to-t from-primary/80 via-primary/30 to-transparent text-surface">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary-fixed">Documentary Record • 08:30 AM</span>
<p className="font-body-sm text-body-sm text-surface-bright mt-1">Master Karigar Narayana smoothing seasoned Hunsur Teak heartwood using a traditional hand jack plane.</p>
</div>
</div>
</div>
{/*  Opening Essay & Thesis  */}
<div className="lg:col-span-5 flex flex-col justify-between h-full pt-space-md lg:pl-space-md">
<div className="space-y-space-lg">
<h2 className="font-display text-headline-md text-primary leading-snug">
              The living imperative of genuine solid heartwood.
            </h2>
<div className="h-px w-12 bg-secondary"></div>
<div className="space-y-space-md text-on-surface-variant font-body-md text-body-md leading-relaxed">
<p className="">
                We live inside environments dominated by hollow surfaces. Flat-pack cabinetry engineered from crushed sawdust and formaldehyde resin, designed with intentional obsolescence to expire within a lease cycle.
              </p>
<p className="">
                At KILN STUDIO, we work exclusively with monolithic cuts of Malabar Teak, Sheesham, and Rosewood. Wood is not a dead, inert substance; it is a cellular archive of seasonal monsoons, mineral-rich soil, and slow decadal growth.
              </p>
<p className="">
                When you rest your palm on a KILN STUDIO dining table, you are feeling ambient temperature equalization, natural lignin resins, and the subtle tactile resistance of fibers that weathered southern Indian sun and rain for over half a century.
              </p>
</div>
{/*  Material Metric Card  */}
<div className="p-space-lg bg-surface-container-low rounded-lg border border-outline-variant/30 mt-space-xl">
<div className="flex items-center justify-between">
<div>
<span className="font-label-caps text-label-caps uppercase text-secondary block">VOC &amp; Toxins</span>
<span className="font-display text-headline-sm text-primary">0.00 %</span>
</div>
<div className="w-px h-10 bg-outline-variant/40"></div>
<div>
<span className="font-label-caps text-label-caps uppercase text-secondary block">Core Timber</span>
<span className="font-display text-headline-sm text-primary">100% Solid</span>
</div>
<div className="w-px h-10 bg-outline-variant/40"></div>
<div>
<span className="font-label-caps text-label-caps uppercase text-secondary block">Life Expectancy</span>
<span className="font-display text-headline-sm text-primary">120+ Yrs</span>
</div>
</div>
</div>
</div>
<div className="pt-space-2xl">
<a className="inline-flex items-center gap-space-xs font-label-caps text-label-caps tracking-widest text-primary hover:text-secondary transition-colors duration-200 uppercase" href="/about#joinery">
              Explore Our Structural Standard
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</section>
{/*  SECTION 2: THE FOUR PILLARS OF PERMANENCE (EDITORIAL DEEP-DIVE)  */}
<section className="bg-surface-container-low border-y border-outline-variant/30 py-space-4xl md:py-space-5xl">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
{/*  Section Header  */}
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-3xl">
<div>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block mb-space-xs">Our Uncompromising Code</span>
<h2 className="font-display text-display-mobile md:text-headline-lg text-primary">The Four Pillars of Permanence</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-space-sm md:mt-0">
            Every dining refectory, low credenza, and lounge chair produced in our atelier studio satisfies four non-negotiable architectural mandates.
          </p>
</div>
{/*  4-Column Bento Architecture Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
{/*  Pillar 01  */}
<div className="bg-surface p-space-xl rounded-lg border border-outline-variant/30 flex flex-col justify-between hover:border-primary transition-colors duration-300">
<div>
<span className="font-display text-headline-lg text-outline-variant/60 block mb-space-md">01</span>
<span className="inline-block px-2 py-0.5 bg-surface-container text-secondary font-label-caps text-label-caps uppercase mb-space-sm rounded">Provenance</span>
<h3 className="font-display text-headline-sm text-primary mb-space-sm">Authentic Materials</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                100% solid timber logs ethically procured exclusively through official Karnataka and Assam state forestry auctions. Zero composite boards, zero micro-veneers, and zero chemical urea binders.
              </p>
</div>
<div className="mt-space-xl pt-space-md border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps">
<span className="">Hunsur &amp; Karwar Teak</span>
<span className="material-symbols-outlined text-[16px]">verified</span>
</div>
</div>
{/*  Pillar 02  */}
<div className="bg-surface p-space-xl rounded-lg border border-outline-variant/30 flex flex-col justify-between hover:border-primary transition-colors duration-300">
<div>
<span className="font-display text-headline-lg text-outline-variant/60 block mb-space-md">02</span>
<span className="inline-block px-2 py-0.5 bg-surface-container text-secondary font-label-caps text-label-caps uppercase mb-space-sm rounded">Structure</span>
<h3 className="font-display text-headline-sm text-primary mb-space-sm">Hand-Cut Joinery</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Blind mortise-and-tenons, sliding dovetails, and pinned through-tenons. Engineered intentionally to accommodate timber movement across monsoon humidity swings and dry seasonal winters.
              </p>
</div>
<div className="mt-space-xl pt-space-md border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps">
<span className="">Zero Screws in Load Paths</span>
<span className="material-symbols-outlined text-[16px]">handyman</span>
</div>
</div>
{/*  Pillar 03  */}
<div className="bg-surface p-space-xl rounded-lg border border-outline-variant/30 flex flex-col justify-between hover:border-primary transition-colors duration-300">
<div>
<span className="font-display text-headline-lg text-outline-variant/60 block mb-space-md">03</span>
<span className="inline-block px-2 py-0.5 bg-surface-container text-secondary font-label-caps text-label-caps uppercase mb-space-sm rounded">Chemistry</span>
<h3 className="font-display text-headline-sm text-primary mb-space-sm">Botanical Finishes</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Completely free of plasticized polyurethane clear coats. Hand-burnished cold-pressed linseed oils, organic raw walnut distillations, and pure Nilgiri beeswax that can be rejuvenated with a linen cloth.
              </p>
</div>
<div className="mt-space-xl pt-space-md border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps">
<span className="">Food-Contact Pure</span>
<span className="material-symbols-outlined text-[16px]">eco</span>
</div>
</div>
{/*  Pillar 04  */}
<div className="bg-surface p-space-xl rounded-lg border border-outline-variant/30 flex flex-col justify-between hover:border-primary transition-colors duration-300">
<div>
<span className="font-display text-headline-lg text-outline-variant/60 block mb-space-md">04</span>
<span className="inline-block px-2 py-0.5 bg-surface-container text-secondary font-label-caps text-label-caps uppercase mb-space-sm rounded">Horizon</span>
<h3 className="font-display text-headline-sm text-primary mb-space-sm">Generational Longevity</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Furniture conceived not for trends or seasons, but for multi-generational transmission. The grain deepens into a warm bronze luster as decades of family meals, journals, and sunlight leave their gentle patina.
              </p>
</div>
<div className="mt-space-xl pt-space-md border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps">
<span className="">Heirloom Warranty</span>
<span className="material-symbols-outlined text-[16px]">history_edu</span>
</div>
</div>
</div>
</div>
</section>
{/*  SECTION 3: CRAFTSMANSHIP & JOINERY IN DETAIL (SPLIT VISUAL SECTION)  */}
<section className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop py-space-4xl md:py-space-5xl" id="joinery">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
{/*  Joinery Detail Macro Photography  */}
<div className="lg:col-span-6 order-2 lg:order-1">
<div className="relative overflow-hidden rounded-lg bg-surface-container border border-outline-variant/40 shadow-sm">
<img className="w-full h-[520px] object-cover hover:scale-[1.03] transition-transform duration-500" alt="Extreme macro photographic study of a hand-chiseled interlocking dovetail corner joint on dark solid rosewood and teak furniture, precise wood grain alignment, architectural minimalism, tactile natural light." src="/images/img_041_stitch.png" />
<div className="absolute top-space-md left-space-md bg-surface/90 backdrop-blur px-3 py-1.5 rounded-DEFAULT border border-outline-variant/30">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">Interlocking Breadboard Tenon</span>
</div>
</div>
</div>
{/*  Joinery Narrative & Structural Breakdown  */}
<div className="lg:col-span-6 order-1 lg:order-2 space-y-space-xl">
<div>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block mb-space-xs">Engineering Without Compromise</span>
<h2 className="font-display text-display-mobile md:text-headline-lg text-primary leading-tight">
              The Joinery That Holds Without Nails.
            </h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Metal fasteners and drywall screws expand and contract at completely different thermal coefficients than natural hardwoods. Over the seasons, screws pull loose and chew through fiber channels. Our master joinery relies on mechanical geometry developed across centuries.
          </p>
{/*  Architectural Accordion/Detail Specs  */}
<div className="space-y-space-md border-t border-outline-variant/30 pt-space-md">
<div className="p-space-md bg-surface-container-low rounded-DEFAULT border border-outline-variant/20">
<div className="flex items-center gap-space-sm mb-1">
<span className="material-symbols-outlined text-secondary text-[20px]">carpenter</span>
<h3 className="font-title-md text-title-md text-primary">Floating Table Aprons</h3>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant pl-7">
                Solid wood tabletops breathe across their width. We affix our aprons using elongated hardwood figure-eight clips, allowing up to 6mm of seasonal expansion without warping or splitting the tabletop.
              </p>
</div>
<div className="p-space-md bg-surface-container-low rounded-DEFAULT border border-outline-variant/20">
<div className="flex items-center gap-space-sm mb-1">
<span className="material-symbols-outlined text-secondary text-[20px]">border_outer</span>
<h3 className="font-title-md text-title-md text-primary">Sliding Lap &amp; Through-Dovetails</h3>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant pl-7">
                Drawer boxes and credenza corners lock with hand-sawn dovetail pins. The mechanical wedge ensures that the more weight you place inside, the tighter the joint binds together.
              </p>
</div>
<div className="p-space-md bg-surface-container-low rounded-DEFAULT border border-outline-variant/20">
<div className="flex items-center gap-space-sm mb-1">
<span className="material-symbols-outlined text-secondary text-[20px]">grid_view</span>
<h3 className="font-title-md text-title-md text-primary">Hand-Woven Cane Rattan Insets</h3>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant pl-7">
                Sourced from wetland palm vines in Assam, each strand is wetted and double-woven through perimeter perforations in solid teak frames, offering natural passive ventilation and enduring tensile support.
              </p>
</div>
</div>
</div>
</div>
</section>
{/*  SECTION 4: THE ATELIER & KARIGAR GUILD  */}
<section className="bg-primary text-surface py-space-4xl md:py-space-5xl">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
<div className="lg:col-span-6 space-y-space-lg">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Peenya &amp; Channapatna Workshops</span>
<h2 className="font-display text-display-mobile md:text-headline-lg text-surface-bright leading-tight">
              A Living Guild of Third-Generation Karigars.
            </h2>
<div className="h-px w-16 bg-secondary"></div>
<p className="font-body-md text-body-md text-surface-variant leading-relaxed">
              In our workshops along the traditional timber belt of Karnataka, craft is not an abstract luxury marketing term. It is an inherited language spoken between the eyes, fingertips, and chisel edge.
            </p>
<p className="font-body-md text-body-md text-surface-variant leading-relaxed">
              Our lead carpenters can determine moisture equilibrium simply by resting their cheek against a freshly sliced plank. They read internal fiber tension and know precisely how a plank will behave when monsoon winds arrive from the Arabian Sea.
            </p>
{/*  Stat Pillars  */}
<div className="grid grid-cols-3 gap-space-md pt-space-lg border-t border-outline/30">
<div>
<span className="font-display text-headline-lg text-secondary-fixed">45</span>
<span className="font-body-sm text-body-sm text-surface-variant block mt-1">Days Solar &amp; Dehumidification Kiln Cycle</span>
</div>
<div>
<span className="font-display text-headline-lg text-secondary-fixed">80+</span>
<span className="font-body-sm text-body-sm text-surface-variant block mt-1">Hours of Hand-Finishing per Suite</span>
</div>
<div>
<span className="font-display text-headline-lg text-secondary-fixed">100%</span>
<span className="font-body-sm text-body-sm text-surface-variant block mt-1">Plastic-Free Jute &amp; Cotton Packaging</span>
</div>
</div>
</div>
{/*  Editorial Workshop Photo using provided asset IMAGE_22  */}
<div className="lg:col-span-6">
<div className="relative rounded-lg overflow-hidden border border-outline/30 shadow-2xl">
<img alt="Master artisans working on a custom oversized solid Hunsur Teak dining table in atelier workshop" className="w-full h-[460px] md:h-[540px] object-cover" src="/images/img_042_stitch.png" />
<div className="p-space-md bg-inverse-surface/90 border-t border-outline/20">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps text-secondary-fixed uppercase">Atelier Bench 03</span>
<span className="font-body-sm text-body-sm text-surface-dim">Hunsur Teak 12-Seater Dining Commission</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  SECTION 5: IN-SITU LIVING SPACES  */}
<section className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop py-space-4xl md:py-space-5xl">
<div className="text-center max-w-2xl mx-auto mb-space-3xl">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block mb-space-xs">Private Architectural Commissions</span>
<h2 className="font-display text-display-mobile md:text-headline-lg text-primary">In-Situ: Objects in Conversation</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
          Witnessing our pieces transition from raw workshop sawdust into sunlit architectural residences.
        </p>
</div>
{/*  Architectural In-Situ Presentation  */}
<div className="relative rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container group">
<img className="w-full h-[520px] md:h-[680px] object-cover transition-transform duration-700 group-hover:scale-[1.01]" alt="Sunlit luxury contemporary apartment living room with expansive balcony over lush greenery, featuring hand-crafted solid teak coffee table, credenza, linen sofa, and warm morning light on limestone floors." src="/images/img_043_stitch.png" />
{/*  Editorial Overlay Card  */}
<div className="absolute bottom-space-md left-space-md right-space-md md:right-auto md:max-w-lg bg-surface/95 backdrop-blur-md p-space-xl rounded-lg border border-outline-variant/30 shadow-lg">
<div className="flex items-center gap-space-xs mb-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px]">location_on</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Bellandur Penthouse Residence</span>
</div>
<h3 className="font-display text-headline-sm text-primary mb-space-xs">
            &ldquo;It holds the quiet rhythm of the trees.&rdquo;
          </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
            &ldquo;Furnishing our home with TEAK HAUS was unlike purchasing commercial furniture. Every guest immediately touches the bevel of the teak table. It breathes warmth into our concrete architectural structure.&rdquo;
          </p>
<div className="flex items-center justify-between pt-space-sm border-t border-outline-variant/30">
<span className="font-label-md text-label-md text-primary font-semibold">Ar. Vikram &amp; Priya Sen</span>
<span className="font-label-caps text-label-caps text-outline uppercase">Custom Hunsur Teak Commission</span>
</div>
</div>
</div>
</section>
{/*  SECTION 6: VISIT OUR FLAGSHIP STUDIOS  */}
<section className="bg-surface-container-low border-t border-outline-variant/30 py-space-4xl">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
{/*  Left Column: Invitation  */}
<div className="lg:col-span-5 space-y-space-md">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">Physical Sanctuaries</span>
<h2 className="font-display text-display-mobile md:text-headline-lg text-primary leading-tight">
              Walk Our Sawdust Floors.
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              We welcome architects, interior designers, and discerning homeowners to experience timber in its physical truth. Come touch seasoned cross-sections, examine joinery mockups, and consult with our master draftsmen.
            </p>
        <StudioCTASection />
</div>
{/*  Right Column: Studio Locations  */}
<div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-space-lg">
{/*  Indiranagar Studio Card  */}
<div className="bg-surface p-space-xl rounded-lg border border-outline-variant/30 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="px-2 py-0.5 bg-surface-container text-secondary font-label-caps text-label-caps uppercase rounded">Primary Studio</span>
<span className="material-symbols-outlined text-outline">apartment</span>
</div>
<h3 className="font-display text-headline-sm text-primary mb-1">Indiranagar Atelier</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  742, 100ft Road, Defence Colony,<br />
                  Indiranagar, Bengaluru 560038
                </p>
<div className="space-y-1 font-body-sm text-body-sm text-outline">
<p className="">Tuesday – Sunday: 10:30 AM – 7:30 PM</p>
<p className="">Sawdust Gallery &amp; Timber Sample Library</p>
</div>
</div>
<div className="mt-space-lg pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
<span className="font-label-caps text-label-caps text-primary uppercase font-semibold">Walk-ins &amp; Appointments</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_outward</span>
</div>
</div>
{/*  Whitefield Studio Card  */}
<div className="bg-surface p-space-xl rounded-lg border border-outline-variant/30 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="px-2 py-0.5 bg-surface-container text-secondary font-label-caps text-label-caps uppercase rounded">Mill &amp; Workshop</span>
<span className="material-symbols-outlined text-outline">precision_manufacturing</span>
</div>
<h3 className="font-display text-headline-sm text-primary mb-1">Whitefield Millworks</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  Plot 18, Inner Circle Road, EPIP Zone,<br />
                  Whitefield, Bengaluru 560066
                </p>
<div className="space-y-1 font-body-sm text-body-sm text-outline">
<p className="">Monday – Saturday: By Prior Appointment</p>
<p className="">Log Seasoning Kilns &amp; Karigar Guild Benches</p>
</div>
</div>
<div className="mt-space-lg pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
<span className="font-label-caps text-label-caps text-primary uppercase font-semibold">Architect Access Only</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_outward</span>
</div>
</div>
</div>
</div>
</div>
</section>

    </div>
  );
}
