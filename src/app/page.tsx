import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="w-full">
      
{/*  3. Desktop Editorial Hero Section  */}
<section className="relative bg-surface pt-space-xl pb-space-4xl overflow-hidden border-b border-outline-variant/30">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="grid grid-cols-12 gap-space-xl items-center">
{/*  Left Column (5 of 12)  */}
<div className="col-span-12 lg:col-span-5 flex flex-col justify-center pr-0 lg:pr-space-md">
<div className="inline-flex items-center gap-2 self-start bg-surface-container px-3 py-1 rounded-full mb-space-md border border-outline-variant/40">
<span className="material-symbols-outlined text-secondary text-[15px]">forest</span>
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">Solid Hardwood Heirloom</span>
</div>
<h1 className="font-display text-display text-primary leading-[1.1] mb-space-md">
            Furniture Made to Last Generations.
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl leading-relaxed">
            Timeless solid wood furniture, handcrafted with character and built for Bangalore homes. Ethically harvested timber, seasoned naturally for South India’s distinct microclimates.
          </p>
<div className="flex flex-wrap items-center gap-space-md mb-space-2xl">
<Link className="inline-flex items-center justify-center h-12 px-7 bg-primary-container text-surface-bright rounded-lg font-title-md text-title-md hover:bg-[#4A2E1B] transition-all duration-150 group active:scale-95 shadow-sm" href="/shop">
              Explore Collections
              <span className="material-symbols-outlined ml-2 text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
</Link>
<Link className="inline-flex items-center justify-center h-12 px-6 border border-primary text-primary rounded-full font-title-md text-title-md hover:bg-primary-container hover:text-surface-bright transition-all duration-150" href="/wood-types">
              Discover Our Woods
            </Link>
</div>
{/*  Trust Badges Row  */}
<div className="pt-space-md border-t border-outline-variant/30 flex flex-col gap-2">
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
<span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
<span className="">100% Verified Ethical Indian Timber (Malabar &amp; Hunsur)</span>
</div>
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
<span className="material-symbols-outlined text-secondary text-[18px]">carpenter</span>
<span className="">Traditional Mortise &amp; Tenon Interlocking Joinery</span>
</div>
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
<span className="material-symbols-outlined text-secondary text-[18px]">workspace_premium</span>
<span className="">Lifetime Structural Guarantee for Bengaluru Residences</span>
</div>
</div>
</div>
{/*  Right Column (7 of 12) Photography Showcase  */}
<div className="col-span-12 lg:col-span-7 relative">
<div className="relative rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/40 shadow-sm aspect-[4/3] group">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Expansive sunlit living room of a modern Bangalore high-rise apartment with floor to ceiling glass windows overlooking lush green canopy trees. A low solid teak wood coffee table and elegant natural fabric sofa rest on a handwoven ivory wool rug. Warm golden afternoon sunlight pours through, casting geometric shadows across polished limestone flooring." src="/images/img_023_stitch.png" />
{/*  Floating Architectural Overlay Card  */}
<div className="absolute bottom-6 left-6 right-6 bg-surface/95 backdrop-blur-md p-space-md rounded-lg border border-outline-variant/50 shadow-lg max-w-md">
<div className="flex items-start justify-between">
<div>
<span className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1">FEATURED RESIDENTIAL INSTALLATION</span>
<h2 className="font-title-md text-title-md text-primary">Penthouse Residence, Bellandur</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Hunsur Teak Fluted Low Table &amp; Hand-loomed Linen Lounger</p>
</div>
<Link className="p-2 text-primary hover:text-secondary transition-colors" href="/#bangalore-homes" title="View Project">
<span className="material-symbols-outlined">north_east</span>
</Link>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  4. Curated Spaces / Collections Grid  */}
<section className="py-space-5xl bg-surface-container-low border-b border-outline-variant/30" id="collections">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-3xl">
<div>
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-2 block">SPATIAL HARMONY</span>
<h2 className="font-display text-headline-lg text-primary">Curated Spaces — Collections Shaped by Architecture</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-4 md:mt-0">
          Every proportion designed to bring calmness, organic warmth, and tactile resonance to contemporary urban living.
        </p>
</div>
{/*  5-Column Curated Gallery Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-md">
{/*  Collection 1: Living Room  */}
<Link className="group flex flex-col bg-surface rounded-lg p-space-sm border border-outline-variant/40 hover:border-primary transition-all duration-300" href="/shop">
<div className="aspect-[3/4] overflow-hidden rounded bg-surface-container relative mb-space-sm">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="A minimalist living room seating arrangement featuring a low-profile handcrafted solid teak arm chair with natural cane webbing backrest and neutral linen upholstery cushion. The piece stands against warm off-white textured plaster walls bathed in soft directional daylight." src="/images/img_024_stitch.png" />
<span className="absolute top-2 right-2 bg-surface/90 text-primary font-label-caps text-[10px] px-2 py-0.5 rounded">14 Designs</span>
</div>
<h3 className="font-display text-title-md text-primary group-hover:text-secondary transition-colors">Living Space</h3>
<p className="font-body-sm text-body-sm text-outline">Low-slung teak loungers &amp; tables</p>
</Link>
{/*  Collection 2: Dining (Using malabar cane chair)  */}
<Link className="group flex flex-col bg-surface rounded-lg p-space-sm border border-outline-variant/40 hover:border-primary transition-all duration-300" href="/products/malabar-dining-chair">
<div className="aspect-[3/4] overflow-hidden rounded bg-surface-container relative mb-space-sm">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Artisanal dining chair sculpted from solid dark Indian rosewood with a gently curved hand-woven rattan cane backrest and contoured wooden seat, photographed in a light-drenched contemporary dining hall with minimal decor." src="/images/img_025_stitch.png" />
<span className="absolute top-2 right-2 bg-surface/90 text-primary font-label-caps text-[10px] px-2 py-0.5 rounded">09 Designs</span>
</div>
<h3 className="font-display text-title-md text-primary group-hover:text-secondary transition-colors">Dining Atelier</h3>
<p className="font-body-sm text-body-sm text-outline">Malabar cane &amp; solid timber chairs</p>
</Link>
{/*  Collection 3: Bedroom  */}
<Link className="group flex flex-col bg-surface rounded-lg p-space-sm border border-outline-variant/40 hover:border-primary transition-all duration-300" href="/shop">
<div className="aspect-[3/4] overflow-hidden rounded bg-surface-container relative mb-space-sm">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="An expansive Japanese-inspired king size low platform bed crafted from solid honey-toned Assam teak with seamless floating side ledges and headboard, styled with crisp washed oatmeal linen sheets in a tranquil sanctuary bedroom." src="/images/img_026_stitch.png" />
<span className="absolute top-2 right-2 bg-surface/90 text-primary font-label-caps text-[10px] px-2 py-0.5 rounded">08 Designs</span>
</div>
<h3 className="font-display text-title-md text-primary group-hover:text-secondary transition-colors">Sleeping Sanctuaries</h3>
<p className="font-body-sm text-body-sm text-outline">Floating platform beds &amp; nightstands</p>
</Link>
{/*  Collection 4: Storage & Credenzas  */}
<Link className="group flex flex-col bg-surface rounded-lg p-space-sm border border-outline-variant/40 hover:border-primary transition-all duration-300" href="/shop">
<div className="aspect-[3/4] overflow-hidden rounded bg-surface-container relative mb-space-sm">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Mid-century modern horizontal solid teak credenza with vertically fluted tambour sliding doors and discrete hand-turned brass knob pulls, set in an airy Bangalore apartment with neutral limestone floors." src="/images/img_027_stitch.png" />
<span className="absolute top-2 right-2 bg-surface/90 text-primary font-label-caps text-[10px] px-2 py-0.5 rounded">11 Designs</span>
</div>
<h3 className="font-display text-title-md text-primary group-hover:text-secondary transition-colors">Storage &amp; Credenzas</h3>
<p className="font-body-sm text-body-sm text-outline">Fluted tambour consoles &amp; dressers</p>
</Link>
{/*  Collection 5: Bespoke Commissions  */}
<Link className="group flex flex-col bg-surface rounded-lg p-space-sm border border-outline-variant/40 hover:border-primary transition-all duration-300" href="/bespoke">
<div className="aspect-[3/4] overflow-hidden rounded bg-primary-container relative mb-space-sm flex flex-col justify-end p-space-md text-surface-bright">
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
<div className="relative z-10">
<span className="material-symbols-outlined text-secondary-container text-3xl mb-2">architecture</span>
<p className="font-label-caps text-[10px] text-secondary-fixed mb-1">TAILORED DIMENSIONS</p>
<h4 className="font-display text-title-md text-surface">Bespoke Commissions</h4>
<p className="font-body-sm text-body-sm text-surface-container-high mt-1">Custom CAD blueprints for luxury floorplans</p>
</div>
</div>
<h3 className="font-display text-title-md text-primary group-hover:text-secondary transition-colors">Architectural Studio</h3>
<p className="font-body-sm text-body-sm text-outline">Custom blueprints &amp; 3D renders</p>
</Link>
</div>
</div>
</section>
{/*  5. Our Woods / Timber Provenance (3 Noble Indian Hardwoods)  */}
<section className="py-space-5xl bg-surface border-b border-outline-variant/30" id="provenance">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="text-center max-w-2xl mx-auto mb-space-3xl">
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-2 block">ETHICAL FORESTRY &amp; TERROIR</span>
<h2 className="font-display text-headline-lg text-primary mb-3">Crafted in Three Noble Indian Hardwoods</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Kiln-dried to 8–10% moisture content calibrated precisely for South India’s humidity shifts, preventing expansion stress or checking over lifetimes.
        </p>
</div>
{/*  3-Column Hardwood Cards  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
{/*  Wood 1: Hunsur Teak  */}
<div className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/40 flex flex-col">
<div className="aspect-square rounded-lg overflow-hidden mb-space-md relative border border-outline-variant/30 shadow-inner">
<img alt="Hunsur Teak Wood Swatch" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png" />
<span className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-caps text-[10px] text-primary">KARNATAKA FORESTRY</span>
</div>
<div className="flex items-baseline justify-between mb-1">
<h3 className="font-display text-headline-sm text-primary">Hunsur Teak</h3>
<span className="font-label-sm text-label-sm text-secondary italic">Tectona Grandis</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Warm golden-amber honey tone enriched with naturally dense protective oils. Revered for legendary resilience against humidity and temperature swings.
          </p>
<div className="mt-auto pt-space-sm border-t border-outline-variant/30 grid grid-cols-2 gap-2 font-label-sm text-label-sm">
<div>
<span className="text-outline block text-[11px]">Provenance:</span>
<span className="text-primary font-medium">Hunsur, Karnataka</span>
</div>
<div>
<span className="text-outline block text-[11px]">Janka Hardness:</span>
<span className="text-primary font-medium">1,070 lbf</span>
</div>
</div>
</div>
{/*  Wood 2: Indian Rosewood / Sheesham  */}
<div className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/40 flex flex-col">
<div className="aspect-square rounded-lg overflow-hidden mb-space-md relative border border-outline-variant/30 shadow-inner">
<img alt="Indian Rosewood Swatch" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png" />
<span className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-caps text-[10px] text-primary">DECCAN PLATEAU</span>
</div>
<div className="flex items-baseline justify-between mb-1">
<h3 className="font-display text-headline-sm text-primary">Indian Rosewood</h3>
<span className="font-label-sm text-label-sm text-secondary italic">Dalbergia Sissoo</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Dramatic chocolate and rich aubergine marbling with heavy structural density. Hand-finished exclusively in organic cold-pressed beeswax.
          </p>
<div className="mt-auto pt-space-sm border-t border-outline-variant/30 grid grid-cols-2 gap-2 font-label-sm text-label-sm">
<div>
<span className="text-outline block text-[11px]">Provenance:</span>
<span className="text-primary font-medium">Deccan Drylands</span>
</div>
<div>
<span className="text-outline block text-[11px]">Janka Hardness:</span>
<span className="text-primary font-medium">1,780 lbf</span>
</div>
</div>
</div>
{/*  Wood 3: Assam Teak  */}
<div className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/40 flex flex-col">
<div className="aspect-square rounded-lg overflow-hidden mb-space-md relative border border-outline-variant/30 shadow-inner">
<img alt="Assam Teak Timber Swatch" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png" />
<span className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-caps text-[10px] text-primary">BRAHMAPUTRA VALLEY</span>
</div>
<div className="flex items-baseline justify-between mb-1">
<h3 className="font-display text-headline-sm text-primary">Assam Teak</h3>
<span className="font-label-sm text-label-sm text-secondary italic">Silviculture Grade</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Subtle olive-golden grain with straight, tight linear fibers. Renowned among Indian master cabinetmakers for unmatched dimensional stability.
          </p>
<div className="mt-auto pt-space-sm border-t border-outline-variant/30 grid grid-cols-2 gap-2 font-label-sm text-label-sm">
<div>
<span className="text-outline block text-[11px]">Provenance:</span>
<span className="text-primary font-medium">Northeast Valley</span>
</div>
<div>
<span className="text-outline block text-[11px]">Janka Hardness:</span>
<span className="text-primary font-medium">1,120 lbf</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  6. Master Craftsmanship & Joinery (Editorial Split)  */}
<section className="py-space-5xl bg-surface-container-low border-b border-outline-variant/30" id="joinery">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="grid grid-cols-12 gap-space-2xl items-center">
{/*  Left: Workshop Photo  */}
<div className="col-span-12 lg:col-span-6 relative">
<div className="relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant/40 shadow-sm aspect-[4/3] group">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="An elderly Indian master carpenter with silver hair and weathered hands working diligently in a sunlit timber workshop. He uses a traditional wooden hand plane across a massive slab of solid honey-toned teak wood, causing fine curly wood shavings to fly in the warm morning light." src="/images/img_028_stitch.png" />
<div className="absolute top-4 left-4 bg-primary-container/90 text-surface-bright px-3 py-1 rounded font-label-caps text-[10px] tracking-widest backdrop-blur-sm">
              CHANNAPATNA-BANGALORE ATELIER
            </div>
</div>
</div>
{/*  Right: Editorial Story & Metrics  */}
<div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-2">HONEST TACTILITY</span>
<h2 className="font-display text-headline-lg text-primary mb-space-md">
            Made by Craft. Designed for Life.
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-md leading-relaxed">
            In our atelier near the border of Bangalore and Channapatna, third-generation karigars plane every plank by eye and touch. We completely reject particle board, chemical MDF, and flimsy paper veneers.
          </p>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-xl leading-relaxed">
            Every dining tabletop, credenza carcass, and bed frame breathes through floating tenon joinery and pure cold-pressed natural linseed oils that deepen into a rich, irreplaceable patina as the decades unfold.
          </p>
{/*  Stat Callouts  */}
<div className="grid grid-cols-3 gap-space-md pt-space-md border-t border-outline-variant/30 mb-space-lg">
<div>
<span className="font-display text-headline-sm text-primary block">100%</span>
<span className="font-label-sm text-label-sm text-outline">Pure Solid Timber</span>
</div>
<div>
<span className="font-display text-headline-sm text-primary block">45+ Days</span>
<span className="font-label-sm text-label-sm text-outline">Kiln Seasoning</span>
</div>
<div>
<span className="font-display text-headline-sm text-primary block">Lifetime</span>
<span className="font-label-sm text-label-sm text-outline">Joinery Warranty</span>
</div>
</div>
<Link className="inline-flex items-center text-primary font-title-md text-title-md hover:text-secondary group transition-colors" href="/shop">
<span className="">Read the Joinery Whitepaper</span>
<span className="material-symbols-outlined ml-2 text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
</Link>
</div>
</div>
</div>
</section>
{/*  7. Signature Pieces Available for Bangalore Delivery  */}
<section className="py-space-5xl bg-surface border-b border-outline-variant/30">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-3xl">
<div>
<div className="flex items-center gap-2 mb-2">
<span className="w-2 h-2 rounded-full bg-emerald-700 inline-block"></span>
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">READY FOR DISPATCH</span>
</div>
<h2 className="font-display text-headline-lg text-primary">Signature Pieces — In-Stock for Bengaluru Delivery</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-3 md:mt-0">
          White-glove room-of-choice delivery and complimentary master installation within 48 hours across all Bangalore PIN codes.
        </p>
</div>
{/*  6 Product Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-xl">
{/*  Product 1: Fluted Credenza  */}
<Link href="/products/p-1" className="group flex flex-col cursor-pointer">
<div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-space-sm relative border border-outline-variant/30">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="A front view of a long horizontal credenza crafted from warm golden solid teak with fluted vertical tambour sliding doors and circular brass hardware, set on a textured ivory carpet against a neutral minimalist wall." src="/images/img_029_stitch.png" />
<span className="absolute top-3 left-3 bg-surface-container-low/95 text-on-primary-fixed-variant px-2.5 py-0.5 rounded font-label-caps text-[10px]">HERITAGE SPEC</span>
</div>
<div className="flex items-start justify-between">
<h3 className="font-display text-title-lg text-primary group-hover:text-secondary transition-colors">Hunsur Fluted Teak Credenza</h3>
<span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">₹1,18,000</span>
</div>
<p className="font-label-sm text-label-sm text-outline mt-0.5">Solid Hunsur Teak • 180cm • Fluted Tambour</p>
</Link>
{/*  Product 2: Cane Chair  */}
<Link href="/products/p-2" className="group flex flex-col cursor-pointer">
<div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-space-sm relative border border-outline-variant/30">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="A studio portrait of a handcrafted dining chair made from solid Indian rosewood with a delicate handwoven wicker cane backrest, soft studio lighting highlighting the rich wood grain and refined joinery." src="/images/img_030_stitch.png" />
<span className="absolute top-3 left-3 bg-surface-container-low/95 text-on-primary-fixed-variant px-2.5 py-0.5 rounded font-label-caps text-[10px]">HAND-WOVEN CANE</span>
</div>
<div className="flex items-start justify-between">
<h3 className="font-display text-title-lg text-primary group-hover:text-secondary transition-colors">Malabar Rattan Dining Chair</h3>
<span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">₹28,500</span>
</div>
<p className="font-label-sm text-label-sm text-outline mt-0.5">Hand-woven Cane &amp; Rosewood • Ergonomic Arch</p>
</Link>
{/*  Product 3: Coffee Table  */}
<Link href="/products/p-3" className="group flex flex-col cursor-pointer">
<div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-space-sm relative border border-outline-variant/30">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Solid low teak coffee table with visible mortise and tenon exposed joinery accents and a recessed open book shelf underneath, sitting comfortably in an airy living space with light terrazzo stone floors." src="/images/img_031_stitch.png" />
<span className="absolute top-3 left-3 bg-surface-container-low/95 text-on-primary-fixed-variant px-2.5 py-0.5 rounded font-label-caps text-[10px]">BESTSELLER</span>
</div>
<div className="flex items-start justify-between">
<h3 className="font-display text-title-lg text-primary group-hover:text-secondary transition-colors">Indiranagar Teak Coffee Table</h3>
<span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">₹54,000</span>
</div>
<p className="font-label-sm text-label-sm text-outline mt-0.5">Solid Teak Planks • Low-Profile Mortise Joinery</p>
</Link>
{/*  Product 4: Platform Bed  */}
<Link href="/products/p-4" className="group flex flex-col cursor-pointer">
<div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-space-sm relative border border-outline-variant/30">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Low profile king size bed platform in solid natural oiled Assam teak with integrated cantilevered floating nightstands, styled with neutral linen duvet and textured cushions in a calm bedroom setting." src="/images/img_032_stitch.png" />
<span className="absolute top-3 left-3 bg-surface-container-low/95 text-on-primary-fixed-variant px-2.5 py-0.5 rounded font-label-caps text-[10px]">HEIRLOOM FRAME</span>
</div>
<div className="flex items-start justify-between">
<h3 className="font-display text-title-lg text-primary group-hover:text-secondary transition-colors">Cubbon Platform Bed</h3>
<span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">₹1,42,000</span>
</div>
<p className="font-label-sm text-label-sm text-outline mt-0.5">King Floating Base • Assam Teak • Slat Support</p>
</Link>
{/*  Product 5: Bookshelf  */}
<Link href="/products/p-5" className="group flex flex-col cursor-pointer">
<div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-space-sm relative border border-outline-variant/30">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Tall open architecture 5-tier bookshelf constructed from dark chocolate Indian sheesham rosewood timber, styled with ceramic vases, art books, and small green potted plants in an architect's study." src="/images/img_033_stitch.png" />
<span className="absolute top-3 left-3 bg-surface-container-low/95 text-on-primary-fixed-variant px-2.5 py-0.5 rounded font-label-caps text-[10px]">DECCAN SHEESHAM</span>
</div>
<div className="flex items-start justify-between">
<h3 className="font-display text-title-lg text-primary group-hover:text-secondary transition-colors">Deccan Sheesham Bookshelf</h3>
<span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">₹72,000</span>
</div>
<p className="font-label-sm text-label-sm text-outline mt-0.5">5 Tiers • Mortise &amp; Tenon • Natural Beeswax</p>
</Link>
{/*  Product 6: Console  */}
<Link href="/products/p-6" className="group flex flex-col cursor-pointer">
<div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-space-sm relative border border-outline-variant/30">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Slender entryway console table with elegantly tapered legs and a smooth beveled edge tabletop crafted from golden solid Hunsur teak, decorated with a brass bowl and dried botanical stems against a stone wall." src="/images/img_034_stitch.png" />
<span className="absolute top-3 left-3 bg-surface-container-low/95 text-on-primary-fixed-variant px-2.5 py-0.5 rounded font-label-caps text-[10px]">ENTRYWAY PIECE</span>
</div>
<div className="flex items-start justify-between">
<h3 className="font-display text-title-lg text-primary group-hover:text-secondary transition-colors">Ulsoor Tapered Console</h3>
<span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">₹46,000</span>
</div>
<p className="font-label-sm text-label-sm text-outline mt-0.5">120cm Width • Tapered Leg Profile • Matte Oil</p>
</Link>
</div>
{/*  Bespoke Banner Callout  */}
<div className="mt-space-3xl p-space-xl bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col md:flex-row items-center justify-between gap-space-lg">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-2xl">draw</span>
</div>
<div>
<h4 className="font-title-lg text-title-lg text-primary">Need tailored dimensions or CAD drawings for your architect?</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">We customize millimeter lengths, drawer depths, and timber finishes to match your floorplans.</p>
</div>
</div>
<a className="inline-flex items-center text-primary font-title-md text-title-md hover:text-secondary whitespace-nowrap group" href="/bespoke">
          Request Bespoke Blueprint CAD
          <span className="material-symbols-outlined ml-1 text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
</a>
</div>
</div>
</section>
{/*  8. Four Pillars of Permanence  */}
<section className="py-space-5xl bg-surface-container-low border-b border-outline-variant/30">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="text-center max-w-xl mx-auto mb-space-3xl">
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-2 block">THE KILN STUDIO ETHOS</span>
<h2 className="font-display text-headline-lg text-primary">Four Pillars of Permanence</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
{/*  Pillar 01  */}
<div className="bg-surface p-space-lg rounded-lg border border-outline-variant/40 flex flex-col">
<span className="font-display text-headline-md text-outline-variant mb-space-md">01</span>
<h3 className="font-title-lg text-title-lg text-primary mb-2">Authentic Materials</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Zero synthetic veneers, zero formaldehyde glue, and zero particle core. Only 100% traceable, sustainably logged timber from certified government depots.
          </p>
</div>
{/*  Pillar 02  */}
<div className="bg-surface p-space-lg rounded-lg border border-outline-variant/40 flex flex-col">
<span className="font-display text-headline-md text-outline-variant mb-space-md">02</span>
<h3 className="font-title-lg text-title-lg text-primary mb-2">Built to Last</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Interlocking mortise, tenon, and hand-cut dovetail joinery that breathes naturally with humidity changes without loosening or creaking.
          </p>
</div>
{/*  Pillar 03  */}
<div className="bg-surface p-space-lg rounded-lg border border-outline-variant/40 flex flex-col">
<span className="font-display text-headline-md text-outline-variant mb-space-md">03</span>
<h3 className="font-title-lg text-title-lg text-primary mb-2">Timeless Design</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Mid-century modernist restraint infused with Karnataka’s centuries-old woodcarving heritage. Free of ephemeral, trendy digital ornamentation.
          </p>
</div>
{/*  Pillar 04  */}
<div className="bg-surface p-space-lg rounded-lg border border-outline-variant/40 flex flex-col">
<span className="font-display text-headline-md text-outline-variant mb-space-md">04</span>
<h3 className="font-title-lg text-title-lg text-primary mb-2">Crafted with Care</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Hand-rubbed exclusively in non-toxic plant oils and organic beeswax for a silky, breathable patina that heals itself with gentle oiling over time.
          </p>
</div>
</div>
</div>
</section>
{/*  9. Harmonizing with Bangalore's Light & Greenery  */}
<section className="py-space-5xl bg-surface border-b border-outline-variant/30" id="bangalore-homes">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="grid grid-cols-12 gap-space-2xl items-center">
<div className="col-span-12 lg:col-span-5">
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-2 block">CONTEXTUAL ARCHITECTURE</span>
<h2 className="font-display text-headline-lg text-primary mb-space-md">
            Harmonizing with Bangalore’s Light &amp; Greenery.
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-md leading-relaxed">
            From high-rise balcony vistas in Bellandur to sunlit heritage verandas in Malleshwaram, our solid woods are engineered to thrive in Bengaluru’s pleasant climate without warping or checking.
          </p>
<blockquote className="p-space-md bg-surface-container-low rounded-lg border-l-2 border-secondary mb-space-lg">
<p className="font-display italic text-body-md text-primary mb-2">
              &ldquo;KILN STUDIO’s teak feels alive in Bangalore daylight. As the sun moves across our living room, the timber grain catches the light with a warmth you can never get from engineered boards.&rdquo;
            </p>
<cite className="font-label-caps text-[10px] text-outline not-italic block">— PRAVEEN &amp; RADHIKA M., SADASHIVANAGAR</cite>
</blockquote>
<div className="flex items-center gap-space-md">
<Link className="inline-flex items-center justify-center h-11 px-6 bg-primary-container text-surface-bright rounded-lg font-title-md text-title-md hover:bg-[#4A2E1B] transition-all" href="/shop">
              View Bangalore Home Tours
            </Link>
</div>
</div>
<div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-space-md">
<div className="rounded-lg overflow-hidden aspect-[4/5] bg-surface-container">
<img className="w-full h-full object-cover" alt="A sunlit Malleshwaram heritage bungalow interior featuring an open courtyard with polished kota stone floors, tropical potted plants, and a custom crafted solid teak low dining table with natural woven chairs." src="/images/img_035_stitch.png" />
</div>
<div className="rounded-lg overflow-hidden aspect-[4/5] bg-surface-container mt-space-xl">
<img className="w-full h-full object-cover" alt="An expansive modern open-concept apartment in Indiranagar Bangalore with wide wooden French windows, a custom sheesham wood bookcase filled with architectural monographs, and soft diffused morning light." src="/images/img_036_stitch.png" />
</div>
</div>
</div>
</div>
</section>
{/*  10. Patron Stories (Testimonials)  */}
<section className="py-space-5xl bg-surface-container-low border-b border-outline-variant/30">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop">
<div className="text-center max-w-xl mx-auto mb-space-3xl">
<span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase mb-2 block">PATRON STORIES</span>
<h2 className="font-display text-headline-lg text-primary">Voices from Bengaluru Homes</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Story 1  */}
<div className="bg-surface p-space-xl rounded-xl border border-outline-variant/40 flex flex-col justify-between">
<div>
<div className="flex text-secondary mb-3">
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant italic mb-space-md leading-relaxed">
              &ldquo;We ordered the 8-seater Hunsur Teak dining table for our villa in Sadashivanagar. The floating joinery is breathtaking. Their delivery team handled the entire assembly with absolute reverence for our space.&rdquo;
            </p>
</div>
<div className="pt-space-sm border-t border-outline-variant/30">
<h4 className="font-title-md text-title-md text-primary">Ananya &amp; Vikram Rao</h4>
<span className="font-label-sm text-label-sm text-outline">Sadashivanagar, Bangalore</span>
</div>
</div>
{/*  Story 2  */}
<div className="bg-surface p-space-xl rounded-xl border border-outline-variant/40 flex flex-col justify-between">
<div>
<div className="flex text-secondary mb-3">
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant italic mb-space-md leading-relaxed">
              &ldquo;As an architect, finding honest solid hardwood craftsmen without veneer tricks in Bangalore was near impossible until we met KILN STUDIO. We’ve commissioned custom credenzas for four client projects now.&rdquo;
            </p>
</div>
<div className="pt-space-sm border-t border-outline-variant/30">
<h4 className="font-title-md text-title-md text-primary">Siddharth Menon</h4>
<span className="font-label-sm text-label-sm text-outline">Principal Architect, Studio Terra, Koramangala</span>
</div>
</div>
{/*  Story 3  */}
<div className="bg-surface p-space-xl rounded-xl border border-outline-variant/40 flex flex-col justify-between">
<div>
<div className="flex text-secondary mb-3">
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
<span className="material-symbols-outlined text-[18px]">star</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant italic mb-space-md leading-relaxed">
              &ldquo;Visiting their Indiranagar experience studio convinced us instantly. The fragrance of authentic beeswax and seasoned teak is intoxicating. The Malabar cane chairs are the comfiest pieces we own.&rdquo;
            </p>
</div>
<div className="pt-space-sm border-t border-outline-variant/30">
<h4 className="font-title-md text-title-md text-primary">Meera Sundaram</h4>
<span className="font-label-sm text-label-sm text-outline">HAL 2nd Stage, Indiranagar</span>
</div>
</div>
</div>
</div>
</section>
{/*  11. Private Atelier Consultation (Final CTA Banner)  */}
<section className="py-space-5xl bg-primary-container text-surface-bright relative overflow-hidden" id="booking">
<div className="max-w-container-max mx-auto px-space-md md:px-gutter-desktop relative z-10">
<div className="max-w-3xl mx-auto text-center">
<span className="font-label-caps text-label-caps text-secondary-fixed tracking-widest uppercase mb-space-xs block">
          COMPLIMENTARY CONSULTATION
        </span>
<h2 className="font-display text-display text-surface mb-space-md leading-tight">
          Bring Natural Character Into Your Home.
        </h2>
<p className="font-body-lg text-body-lg text-surface-container-high mb-space-2xl leading-relaxed">
          Visit our Bangalore experience studios in Indiranagar &amp; Whitefield, or consult with our master woodworkers for bespoke blueprints tailored to your residential architecture.
        </p>
<div className="flex flex-wrap items-center justify-center gap-space-md mb-space-3xl">
<Link className="inline-flex items-center justify-center h-12 px-8 bg-surface-bright text-primary rounded-lg font-title-md text-title-md hover:bg-surface-container transition-all active:scale-95 shadow-md" href="/shop">
            Schedule Studio Walkthrough
          </Link>
<Link className="inline-flex items-center justify-center h-12 px-7 border border-surface-container text-surface-bright rounded-full font-title-md text-title-md hover:bg-surface-bright/10 transition-all" href="/shop">
            Download Wood Sample Guide
          </Link>
</div>
{/*  Highlights Footer Strip  */}
<div className="pt-space-lg border-t border-on-primary-container/30 grid grid-cols-1 md:grid-cols-3 gap-space-md text-surface-container-high font-body-sm text-body-sm">
<div className="flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-secondary-container">local_shipping</span>
<span className="">White-Glove Delivery Across Bangalore</span>
</div>
<div className="flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-secondary-container">handyman</span>
<span className="">Complimentary Master Assembly</span>
</div>
<div className="flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-secondary-container">verified</span>
<span className="">100% Solid Timber Lifetime Warranty</span>
</div>
</div>
</div>
</div>
</section>
{/*  12. Shared Component: Footer  */}

    </div>
  );
}
