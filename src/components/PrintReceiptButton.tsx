"use client";

export default function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#d3c3bd] hover:border-[#0e0300] text-[#0e0300] rounded-xl text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
      title="Print or save PDF receipt"
    >
      <span className="material-symbols-outlined text-[18px]">print</span>
      <span>Print Receipt</span>
    </button>
  );
}
