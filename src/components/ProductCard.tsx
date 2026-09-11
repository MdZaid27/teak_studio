import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export default function ProductCard({
  product,
  className = "",
  priority = false,
}: ProductCardProps) {
  const slug = product.slug || (product.link ? product.link.replace(/^\/(products|shop)\//, "") : product.id);

  return (
    <Link
      href={`/shop/${slug}`}
      className={`group relative bg-[#ffffff] rounded-2xl overflow-hidden border border-[#d3c3bd]/40 hover:border-[#895029]/50 transition-all duration-300 hover:shadow-xl flex flex-col cursor-pointer ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-[#f6f3ee] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        {product.isPopular && (
          <span className="absolute top-3 left-3 bg-[#0e0300]/80 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Atelier Highlight
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#895029] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#d3c3bd]/30">
          {product.timber}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#81746f]">
            {product.category} Collection
          </div>
          <h3 className="font-display text-lg text-[#0e0300] font-normal leading-snug group-hover:text-[#895029] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-[#81746f] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <p className="text-[11px] text-[#4f4540] font-medium pt-1">
            Dimensions: {product.dimensions}
          </p>
        </div>

        {/* Minimalist Price Row — Sans-Serif Tabular Nums Only */}
        <div className="pt-3 border-t border-[#f0ede9] flex items-center justify-between">
          <span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
