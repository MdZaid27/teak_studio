import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalog & Inventory | TEAK HAUS Atelier Console",
  description: "Manage heirloom timber inventory, specifications, and pricing.",
};

export default async function AdminProductsPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2724]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] font-medium">
              Catalog &amp; Inventory
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono bg-[#1C1A18] border border-[#3E3A35] text-[#D4A373] rounded-full">
              {products.length} Heirlooms
            </span>
          </div>
          <p className="mt-1 text-xs text-[#9B9287] font-light">
            Architectural timber catalog, joinery specifications, and atelier stock availability.
          </p>
        </div>

        <Link
          href="/shop"
          target="_blank"
          className="px-4 py-2 rounded-lg bg-[#1C1A18] hover:bg-[#2A2724] border border-[#3E3A35] text-xs font-mono text-[#D4A373] hover:text-[#FAF9F6] transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>View Public Shop</span>
          <span className="text-[11px]">↗</span>
        </Link>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#161514] border border-[#2A2724] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C1A18] border-b border-[#2A2724] text-[#9B9287] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Piece</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Primary Timber</th>
                <th className="px-5 py-3.5">Dimensions</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Dispatch Readiness</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2724] font-light text-[#FAF9F6]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#1C1A18]/50 transition-colors">
                  {/* Thumbnail + Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#1C1A18] border border-[#2A2724] overflow-hidden shrink-0 relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <div className="font-serif font-medium text-sm text-[#FAF9F6]">
                          {product.name}
                        </div>
                        {product.tagline && (
                          <div className="text-[11px] text-[#9B9287] truncate max-w-[200px]">
                            {product.tagline}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 text-[#C9BFB5] capitalize">
                    {product.category}
                  </td>

                  {/* Timber */}
                  <td className="px-5 py-4 font-medium text-[#D4A373]">
                    {product.timber || "Hunsur Teak"}
                  </td>

                  {/* Dimensions */}
                  <td className="px-5 py-4 text-[#9B9287] font-mono text-[11px]">
                    {product.dimensions || "Custom"}
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 font-sans tabular-nums font-semibold text-[#FAF9F6]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  {/* Dispatch Readiness */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#1E2922] text-[#4ADE80] border border-[#22C55E]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                      <span>{product.leadTime || "In Stock — 48h Dispatch"}</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={product.link || `/shop/${product.slug || product.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded bg-[#1C1A18] hover:bg-[#2A2724] border border-[#3E3A35] text-[11px] font-mono text-[#D4A373] hover:text-[#FAF9F6] transition-colors inline-flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <span className="text-[10px]">↗</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
