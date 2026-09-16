import Link from "next/link";
import Image from "next/image";

const promoMessages = [
  "✦  Free White-Glove Delivery on orders above ₹50,000",
  "✦  Complimentary Master Assembly Included Nationwide",
  "✦  Lifetime Structural Guarantee on All Commissioned Pieces",
  "✦  Visit Our Flagship Studio — Indiranagar & Whitefield",
  "✦  Built-to-Order Bespoke Commissions: 10–14 Day Lead Time",
];

const categories = [
  {
    label: "Living Room",
    sub: "Sofas, Coffee Tables & Loungers",
    count: "14 Designs",
    href: "/shop",
    image: "/images/img_024_stitch.png",
    alt: "Solid teak armchair with cane backrest in a sunlit living room",
  },
  {
    label: "Dining",
    sub: "Tables, Chairs & Benches",
    count: "09 Designs",
    href: "/shop",
    image: "/images/img_025_stitch.png",
    alt: "Astrid woven cane dining chair in a contemporary dining room",
  },
  {
    label: "Bedroom",
    sub: "Platform Beds & Nightstands",
    count: "08 Designs",
    href: "/shop",
    image: "/images/img_026_stitch.png",
    alt: "Low-profile floating platform bed in a serene bedroom",
  },
  {
    label: "Storage",
    sub: "Credenzas, Shelves & Consoles",
    count: "11 Designs",
    href: "/shop",
    image: "/images/img_027_stitch.png",
    alt: "Fluted tambour teak credenza against a minimalist wall",
  },
  {
    label: "Bespoke",
    sub: "Custom Blueprints & 3D Renders",
    count: "Unlimited",
    href: "/bespoke",
    image: "/images/img_028_stitch.png",
    alt: "Master craftsman planing solid teak in a sunlit workshop",
  },
];

const bestsellers = [
  {
    id: "malabar-dining-chair",
    name: "The Astrid Cane Dining Chair",
    timber: "Indian Rosewood",
    price: "₹28,500",
    badge: "Bestseller",
    href: "/products/malabar-dining-chair",
    image: "/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png",
    alt: "The Astrid Cane Dining Chair in Indian Rosewood",
  },
  {
    id: "hunsur-teak-dining-table",
    name: "The Monolith Architectural Dining Table",
    timber: "Hunsur Teak",
    price: "₹85,000",
    badge: "New Arrival",
    href: "/products/hunsur-teak-dining-table",
    image: "/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png",
    alt: "The Monolith Architectural Dining Table in solid teak",
  },
  {
    id: "fluted-tambour-credenza",
    name: "The Soren Fluted Media Credenza",
    timber: "Hunsur Teak",
    price: "₹72,000",
    badge: "Heritage Spec",
    href: "/products/fluted-tambour-credenza",
    image: "/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png",
    alt: "The Soren Fluted Media Credenza sideboard",
  },
  {
    id: "cubbon-platform-bed",
    name: "The Haven Platform Bed — King",
    timber: "Assam Teak",
    price: "₹1,42,000",
    badge: "Heirloom Frame",
    href: "/shop",
    image: "/images/img_032_stitch.png",
    alt: "The Haven Platform Bed in solid Assam teak",
  },
];

const materials = [
  {
    name: "Hunsur Teak",
    latin: "Tectona Grandis",
    origin: "Karnataka Forestry",
    swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
    desc: "Warm golden-amber honey tone with legendary natural oils.",
    href: "/wood-types",
  },
  {
    name: "Indian Rosewood",
    latin: "Dalbergia Sissoo",
    origin: "Deccan Plateau",
    swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
    desc: "Dramatic chocolate & aubergine marbling with structural density.",
    href: "/wood-types",
  },
  {
    name: "Assam Teak",
    latin: "Silviculture Grade",
    origin: "Brahmaputra Valley",
    swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
    desc: "Subtle olive-golden grain prized for dimensional stability.",
    href: "/wood-types",
  },
];

const stats = [
  { value: "4.9★", label: "Average Rating", sub: "1,200+ verified reviews" },
  { value: "3,800+", label: "Homes Furnished", sub: "Across 24 Indian cities" },
  { value: "Lifetime", label: "Joinery Warranty", sub: "On all commissioned pieces" },
  { value: "48h", label: "White-Glove Delivery", sub: "In urban dispatch zones" },
];

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">

      {/* 1. Promotional Ticker */}
      <div className="bg-[#2c1a11] text-[#feb383] overflow-hidden py-2.5 select-none">
        <div className="flex whitespace-nowrap animate-ticker" aria-hidden="true">
          {[...promoMessages, ...promoMessages, ...promoMessages, ...promoMessages].map((msg, i) => (
            <span key={i} className="font-sans text-[11px] font-semibold tracking-widest uppercase mx-8">
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Full-Viewport Hero */}
      <section className="relative h-[92vh] min-h-[620px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/img_023_stitch.png"
            alt="Sunlit modern penthouse with solid teak furniture and floor-to-ceiling windows"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative z-10 w-full max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 pb-16 md:pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#feb383] inline-block"></span>
              <span className="text-[#feb383] font-sans text-[11px] font-bold tracking-widest uppercase">
                Solid Hardwood · Handcrafted in India
              </span>
            </div>
            <h1 className="font-display text-[3.8rem] md:text-[5rem] lg:text-[6rem] text-white leading-[1.05] tracking-[-0.02em] mb-6 animate-fade-in-up animate-delay-100">
              Furniture Made<br />
              <span className="italic text-[#feb383]">to Last Generations.</span>
            </h1>
            <p className="font-sans text-base md:text-lg text-white/75 mb-8 leading-relaxed max-w-lg animate-fade-in-up animate-delay-200">
              Timeless solid wood furniture — ethically harvested, hand-jointed with traditional mortise &amp; tenon, and built for the discerning Indian home.
            </p>
            <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up animate-delay-300">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#895029] text-white rounded-lg font-sans font-semibold text-sm tracking-wide hover:bg-[#6f3e1e] transition-all duration-200 active:scale-95 shadow-lg gap-2"
              >
                Shop Collections
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                href="/bespoke"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg font-sans font-semibold text-sm tracking-wide hover:bg-white/20 transition-all duration-200 gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">architecture</span>
                Bespoke Commission
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 animate-fade-in-up animate-delay-400">
              {[
                { icon: "verified", text: "100% Traceable Indian Timber" },
                { icon: "workspace_premium", text: "Lifetime Joinery Warranty" },
                { icon: "local_shipping", text: "White-Glove Delivery" },
              ].map((t) => (
                <div key={t.icon} className="flex items-center gap-1.5 text-white/70 text-xs font-sans">
                  <span className="material-symbols-outlined text-[#feb383] text-[15px]">{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-6 md:right-16 z-10 hidden md:block animate-scale-in animate-delay-500">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/60 max-w-xs">
            <p className="text-[10px] text-[#895029] font-bold uppercase tracking-widest mb-1">Featured Installation</p>
            <p className="font-display text-[#0e0300] text-base leading-snug font-medium">Penthouse Residence, Bellandur</p>
            <p className="text-[11px] text-[#81746f] mt-0.5">Hunsur Teak Low Table &amp; Linen Lounger</p>
          </div>
        </div>
      </section>

      {/* 3. Shop by Room */}
      <section className="py-20 bg-[#fcf9f4]">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#895029] block mb-1">Explore</span>
              <h2 className="font-display text-4xl md:text-5xl text-[#0e0300]">Shop by Room</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-[#895029] hover:text-[#0e0300] transition-colors group">
              View All Collections
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.label} href={cat.href} className="category-card group relative rounded-2xl overflow-hidden bg-[#f0ede9] aspect-[3/4] flex flex-col justify-end cursor-pointer">
                <Image src={cat.image} alt={cat.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0300]/80 via-[#0e0300]/20 to-transparent" />
                <span className="absolute top-3 right-3 bg-white/90 text-[#0e0300] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">{cat.count}</span>
                <div className="relative z-10 p-4">
                  <h3 className="font-display text-lg text-white leading-tight">{cat.label}</h3>
                  <p className="text-[11px] text-white/70 font-sans mt-0.5">{cat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Bestselling Products */}
      <section className="py-20 bg-white border-y border-[#d3c3bd]/30">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#895029]">Ready for Dispatch</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-[#0e0300]">Bestselling Pieces</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-[#895029] hover:text-[#0e0300] transition-colors group">
              Browse Full Collection
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <Link key={product.id} href={product.href} className="product-card-root group relative bg-[#fcf9f4] rounded-2xl overflow-hidden border border-[#d3c3bd]/30 hover:border-[#895029]/40 hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ede9]">
                  <Image src={product.image} alt={product.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute top-3 left-3 bg-[#2c1a11]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">{product.badge}</span>
                  <div className="product-overlay absolute inset-0 bg-[#0e0300]/40 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 bg-white text-[#0e0300] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-lg">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      View Product
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-[#0e0300] leading-snug group-hover:text-[#895029] transition-colors">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0ede9]">
                    <span className="font-sans text-xl font-bold text-[#0e0300] tabular-nums">{product.price}</span>
                    <span className="inline-flex items-center gap-1 text-[#895029] text-[11px] font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                      Shop Now
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Lifestyle Editorial */}
      <section className="py-20 bg-[#f6f3ee]">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#895029] block mb-1">Atelier Homes</span>
              <h2 className="font-display text-4xl md:text-5xl text-[#0e0300]">Room Inspiration</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-[#895029] hover:text-[#0e0300] transition-colors group">
              Explore All Rooms
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative rounded-2xl overflow-hidden min-h-[400px] md:min-h-[560px] cursor-pointer">
              <Image src="/images/img_035_stitch.png" alt="Sunlit Malleshwaram heritage bungalow interior with teak dining table" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0300]/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] text-[#feb383] font-bold uppercase tracking-widest mb-1">Living Room</p>
                <h3 className="font-display text-2xl text-white leading-tight">Heritage Bungalow, Malleshwaram</h3>
                <p className="text-xs text-white/65 mt-1 font-sans">Solid Teak Low Dining Table &amp; Natural Woven Chairs</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
                <Image src="/images/img_036_stitch.png" alt="Open-concept apartment with sheesham wood bookcase" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0300]/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[10px] text-[#feb383] font-bold uppercase tracking-widest mb-0.5">Study</p>
                  <h3 className="font-display text-lg text-white">Modern Open-Concept Apartment</h3>
                </div>
              </div>
              <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
                <Image src="/images/img_032_stitch.png" alt="Low-profile platform bed with floating nightstands" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0300]/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[10px] text-[#feb383] font-bold uppercase tracking-widest mb-0.5">Bedroom</p>
                  <h3 className="font-display text-lg text-white">The Haven Platform Bed — King</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Materials Provenance Strip */}
      <section className="py-16 bg-[#2c1a11]">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#feb383] block mb-2">Ethical Forestry</span>
            <h2 className="font-display text-4xl md:text-5xl text-white">Three Noble Indian Hardwoods</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materials.map((mat) => (
              <Link key={mat.name} href={mat.href} className="group flex gap-4 p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#feb383]/40 rounded-2xl transition-all duration-300 cursor-pointer">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/15">
                  <Image src={mat.swatch} alt={`${mat.name} wood swatch`} fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <div className="text-[10px] text-[#feb383] font-bold uppercase tracking-widest mb-0.5">{mat.origin}</div>
                  <h3 className="font-display text-xl text-white leading-snug group-hover:text-[#feb383] transition-colors">{mat.name}</h3>
                  <p className="text-[11px] italic text-white/50 font-sans mb-1">{mat.latin}</p>
                  <p className="text-xs text-white/60 font-sans leading-relaxed">{mat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/wood-types" className="inline-flex items-center gap-1.5 text-[#feb383] text-sm font-semibold hover:text-white transition-colors group">
              Discover Timber Provenance &amp; Certification
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Craftsmanship Split */}
      <section className="py-20 bg-[#fcf9f4]">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
              <Image src="/images/img_028_stitch.png" alt="Elderly Indian master carpenter planing solid teak in a sunlit workshop" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-4 left-4 bg-[#2c1a11]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">Heritage Timber Atelier</div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#895029] block mb-3">Honest Tactility</span>
              <h2 className="font-display text-4xl md:text-5xl text-[#0e0300] mb-6 leading-[1.1]">
                Made by Craft.<br />
                <span className="italic">Designed for Life.</span>
              </h2>
              <p className="font-sans text-base text-[#4f4540] mb-4 leading-relaxed">
                In our regional atelier near Channapatna, third-generation <em>karigars</em> plane every plank by eye and touch. We completely reject particle board, chemical MDF, and flimsy paper veneers.
              </p>
              <p className="font-sans text-sm text-[#81746f] mb-8 leading-relaxed">
                Every dining tabletop, credenza carcass, and bed frame breathes through floating tenon joinery and pure cold-pressed natural linseed oils that deepen into a rich patina over decades.
              </p>
              <div className="grid grid-cols-3 gap-6 py-6 border-y border-[#d3c3bd]/40 mb-8">
                {[
                  { value: "100%", label: "Pure Solid Timber" },
                  { value: "45+ Days", label: "Kiln Seasoning" },
                  { value: "Lifetime", label: "Joinery Warranty" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-3xl text-[#0e0300]">{s.value}</p>
                    <p className="text-xs text-[#81746f] font-sans mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-[#895029] font-semibold text-sm hover:text-[#0e0300] transition-colors group">
                Our Craft &amp; Philosophy
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Stats Bar */}
      <section className="py-14 bg-[#f0ede9] border-y border-[#d3c3bd]/40">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <p className="font-display text-4xl md:text-5xl text-[#0e0300]">{s.value}</p>
                <p className="text-sm font-bold text-[#2c1a11] font-sans">{s.label}</p>
                <p className="text-[11px] text-[#81746f] font-sans">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#895029] block mb-2">Patron Stories</span>
            <h2 className="font-display text-4xl md:text-5xl text-[#0e0300]">Voices from Discerning Homes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "We ordered the 8-seater Hunsur Teak dining table for our villa in Sadashivanagar. The floating joinery is breathtaking. Their delivery team handled everything with absolute reverence.",
                name: "Ananya & Vikram Rao",
                location: "Sadashivanagar, Bangalore",
              },
              {
                quote: "As an architect, finding honest solid hardwood craftsmen without veneer tricks was near impossible until TEAK HAUS. We have commissioned custom credenzas for four client projects now.",
                name: "Siddharth Menon",
                location: "Principal Architect, Studio Terra, Koramangala",
              },
              {
                quote: "Visiting their Indiranagar studio convinced us instantly. The fragrance of authentic beeswax and seasoned teak is intoxicating. The Malabar cane chairs are the comfiest pieces we own.",
                name: "Meera Sundaram",
                location: "HAL 2nd Stage, Indiranagar",
              },
            ].map((t) => (
              <div key={t.name} className="bg-[#fcf9f4] rounded-2xl p-7 border border-[#d3c3bd]/30 flex flex-col justify-between gap-5">
                <div>
                  <div className="flex text-[#895029] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[17px]">star</span>
                    ))}
                  </div>
                  <p className="font-sans text-sm text-[#4f4540] italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="pt-4 border-t border-[#d3c3bd]/30">
                  <p className="font-display text-base text-[#0e0300]">{t.name}</p>
                  <p className="text-[11px] text-[#81746f] font-sans">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Studio Booking CTA */}
      <section className="py-24 bg-[#2c1a11] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#feb383] block mb-4">Complimentary Consultation</span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 max-w-3xl mx-auto">
            Bring Natural<br />
            <span className="italic text-[#feb383]">Character Home.</span>
          </h2>
          <p className="font-sans text-base md:text-lg text-white/60 mb-10 leading-relaxed max-w-xl mx-auto">
            Visit our flagship experience studios in Indiranagar &amp; Whitefield, or consult with our master woodworkers for bespoke blueprints tailored to your architecture.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link href="/bespoke" className="inline-flex items-center justify-center px-8 py-4 bg-[#895029] text-white rounded-lg font-sans font-semibold text-sm tracking-wide hover:bg-[#6f3e1e] transition-all active:scale-95 shadow-lg gap-2">
              <span className="material-symbols-outlined text-[18px]">architecture</span>
              Book Studio Walkthrough
            </Link>
            <Link href="/shop" className="inline-flex items-center justify-center px-7 py-4 border border-white/25 text-white rounded-lg font-sans font-semibold text-sm tracking-wide hover:bg-white/10 transition-all gap-2">
              Browse All Products
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="pt-10 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { icon: "local_shipping", text: "Free White-Glove Delivery", sub: "On orders above ₹50,000" },
              { icon: "handyman", text: "Complimentary Assembly", sub: "Master installation included" },
              { icon: "verified", text: "Lifetime Warranty", sub: "On all joinery & frames" },
            ].map((b) => (
              <div key={b.icon} className="flex flex-col items-center gap-1.5">
                <span className="material-symbols-outlined text-[#feb383] text-[24px]">{b.icon}</span>
                <span className="text-sm text-white font-sans font-semibold">{b.text}</span>
                <span className="text-[11px] text-white/45 font-sans">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
