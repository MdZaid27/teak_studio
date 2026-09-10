import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl text-[#0e0300] mb-3">Product Not Found</h1>
      <p className="text-sm text-[#81746f] mb-6">
        The furniture piece you are looking for may have moved or is a custom bespoke commission.
      </p>
      <Link
        href="/shop"
        className="px-6 py-3 bg-[#0e0300] text-white rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-[#895029] transition-colors"
      >
        Return to Collections
      </Link>
    </div>
  );
}
