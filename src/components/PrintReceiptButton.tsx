"use client";

interface PrintReceiptButtonProps {
  className?: string;
  label?: string;
}

export default function PrintReceiptButton({
  className,
  label = "Download Tax Invoice",
}: PrintReceiptButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ||
        "px-4 py-2.5 bg-white border border-[#EAE7E1] hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FAF9F6] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer print:hidden"
      }
      title="Download and print official tax invoice receipt"
    >
      <span className="material-symbols-outlined text-[17px] text-[#895029]">receipt_long</span>
      <span>{label}</span>
    </button>
  );
}
