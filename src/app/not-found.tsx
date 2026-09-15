import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121110] text-[#FAF9F6] flex flex-col justify-between selection:bg-[#c2410c] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#2A2724] bg-[#161514]/90 backdrop-blur-md px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/brand/teak-haus-dark.png"
              alt="TEAK HAUS"
              width={36}
              height={36}
              className="w-8 h-8 object-contain rounded-lg border border-[#2A2724]"
            />
            <span className="font-serif text-lg tracking-wide text-[#FAF9F6]">TEAK HAUS</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#81746f] font-mono">
            Error 404 · Uncharted Timber
          </span>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full bg-[#1F1C19] border border-[#3E3A35] text-xs font-mono text-[#D4A373] uppercase tracking-widest">
            Provenance Unknown
          </div>

          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-[#FAF9F6] mb-4">
            This Piece Has Not Yet Been Carved
          </h1>

          <p className="text-[#A89F91] text-sm md:text-base leading-relaxed mb-8 font-sans">
            The architectural statement or atelier archive you are seeking does not exist or has been retired to our private library. Explore our current catalogue or commission a custom heirloom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#FAF9F6] text-[#121110] text-xs uppercase tracking-[0.2em] font-medium rounded-lg hover:bg-[#E5DFD5] transition-colors"
            >
              Explore Collection
            </Link>

            <Link
              href="/bespoke"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1C1A18] border border-[#3E3A35] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium rounded-lg hover:border-[#D4A373] transition-colors"
            >
              Bespoke Commission
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 text-[#81746f] hover:text-[#FAF9F6] text-xs uppercase tracking-[0.2em] transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>

      {/* Subtle Atelier Footer */}
      <footer className="border-t border-[#2A2724] px-6 py-4 text-center text-xs text-[#81746f]">
        TEAK HAUS Atelier · Heritage Teak, Rosewood & Bespoke Solid Wood Joinery
      </footer>
    </div>
  );
}
