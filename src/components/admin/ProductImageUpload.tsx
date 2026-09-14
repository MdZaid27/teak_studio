"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ProductImageUploadProps {
  primaryImage: string;
  galleryImages: string[];
  onPrimaryImageChange: (url: string) => void;
  onGalleryImagesChange: (urls: string[]) => void;
}

// Curated showroom image presets for fast selection
const CURATED_IMAGE_PRESETS = [
  "/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png",
  "/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png",
  "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
  "/images/stitch_screen_e1a112d35ebd4db8b6f1fd9abded5f9e.png",
  "/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png",
  "/images/stitch_screen_9e6fefca1fcd4a72bece565d08906c86.png",
];

/**
 * Compresses and converts any image file into a high-efficiency WebP blob on the client.
 */
async function compressImageToWebP(
  file: File,
  maxDimension = 1920,
  quality = 0.88
): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                originalSize: file.size,
                compressedSize: blob.size,
              });
            } else {
              // Fallback to original if conversion fails
              resolve({
                blob: file,
                originalSize: file.size,
                compressedSize: file.size,
              });
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProductImageUpload({
  primaryImage,
  galleryImages,
  onPrimaryImageChange,
  onGalleryImagesChange,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Combine primary and gallery for grid operations
  const allImages = [
    ...(primaryImage ? [{ url: primaryImage, isHero: true }] : []),
    ...galleryImages
      .filter((u) => u !== primaryImage)
      .map((url) => ({ url, isHero: false })),
  ];

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const newUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadStatus(`Optimizing image ${i + 1}/${fileArray.length}...`);

      try {
        const { blob, originalSize, compressedSize } = await compressImageToWebP(file);
        const savingsPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);

        setUploadStatus(
          `Uploading ${file.name.slice(0, 20)}... (${formatBytes(originalSize)} → ${formatBytes(compressedSize)}, -${savingsPercent}%)`
        );

        const formData = new FormData();
        formData.append("file", blob, file.name.replace(/\.[^/.]+$/, ".webp"));

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Upload failed");
        }

        if (data.url) {
          newUrls.push(data.url);
        }
      } catch (err: unknown) {
        console.error("Upload error:", err);
        setUploadError(err instanceof Error ? err.message : "Failed to upload image");
      }
    }

    if (newUrls.length > 0) {
      if (!primaryImage) {
        onPrimaryImageChange(newUrls[0]);
        onGalleryImagesChange([...galleryImages, ...newUrls.slice(1)]);
      } else {
        onGalleryImagesChange([...galleryImages, ...newUrls]);
      }
    }

    setIsUploading(false);
    setUploadStatus(null);
  };

  const handleSetHero = (url: string) => {
    const oldHero = primaryImage;
    onPrimaryImageChange(url);
    const updatedGallery = galleryImages
      .filter((u) => u !== url)
      .concat(oldHero ? [oldHero] : []);
    onGalleryImagesChange(Array.from(new Set(updatedGallery)));
  };

  const handleRemoveImage = (urlToRemove: string) => {
    if (primaryImage === urlToRemove) {
      if (galleryImages.length > 0) {
        onPrimaryImageChange(galleryImages[0]);
        onGalleryImagesChange(galleryImages.slice(1));
      } else {
        onPrimaryImageChange("");
      }
    } else {
      onGalleryImagesChange(galleryImages.filter((u) => u !== urlToRemove));
    }
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    // Reorder in gallery
    const items = [...galleryImages];
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    onGalleryImagesChange(items);
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (!primaryImage) {
      onPrimaryImageChange(trimmed);
    } else if (!galleryImages.includes(trimmed)) {
      onGalleryImagesChange([...galleryImages, trimmed]);
    }
    setManualUrl("");
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 group ${
          isDragging
            ? "border-[#D4A373] bg-[#D4A373]/10 scale-[1.01]"
            : "border-[#3E3A35] hover:border-[#D4A373]/80 bg-[#161514] hover:bg-[#1C1A18]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-[#24211E] border border-[#3E3A35] group-hover:border-[#D4A373] flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-[#D4A373] text-[24px]">
            cloud_upload
          </span>
        </div>

        <div>
          <div className="text-xs font-serif font-medium text-[#FAF9F6] group-hover:text-[#D4A373] transition-colors">
            Drop high-res atelier photography here, or browse
          </div>
          <p className="text-[11px] text-[#706860] font-mono mt-0.5">
            Auto-compressed to WebP &amp; uploaded to Supabase Storage CDN (PNG, JPEG, WebP up to 10MB)
          </p>
        </div>
      </div>

      {/* Upload Progress / Status */}
      {isUploading && (
        <div className="p-3.5 rounded-xl bg-[#1C1A18] border border-[#D4A373]/40 flex items-center gap-3 text-xs font-mono text-[#D4A373] animate-pulse">
          <span className="w-4 h-4 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{uploadStatus || "Uploading to Supabase CDN..."}</span>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Gallery Grid */}
      {allImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#9B9287]">
            <span>
              Catalog Photos ({allImages.length}) · Primary Hero + {allImages.length - 1} Angle(s)
            </span>
            <span className="text-[10px] text-[#706860]">First image is Hero</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allImages.map((img, idx) => (
              <div
                key={img.url + idx}
                className={`group relative aspect-square rounded-xl overflow-hidden border transition-all ${
                  img.isHero
                    ? "border-[#D4A373] shadow-lg shadow-[#D4A373]/10 ring-1 ring-[#D4A373]/50"
                    : "border-[#2A2724] hover:border-[#3E3A35] bg-[#161514]"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Product view ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {img.isHero ? (
                    <span className="px-2 py-0.5 rounded bg-[#D4A373] text-[#121110] font-mono text-[9px] font-bold tracking-wider uppercase shadow">
                      ★ HERO PIECE
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-black/70 text-[#9B9287] font-mono text-[9px]">
                      Angle #{idx}
                    </span>
                  )}
                </div>

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.url)}
                      className="p-1 rounded-full bg-red-950/80 hover:bg-red-900 text-red-200 transition-colors"
                      title="Remove image"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {!img.isHero && (
                      <button
                        type="button"
                        onClick={() => handleSetHero(img.url)}
                        className="w-full py-1 px-2 rounded bg-[#D4A373] hover:bg-[#C29263] text-[#121110] text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        <span>Set as Hero</span>
                      </button>
                    )}

                    {!img.isHero && galleryImages.length > 1 && (
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => handleMove(idx - 1, "left")}
                          className="p-1 rounded bg-[#24211E] hover:bg-[#3E3A35] text-white"
                          title="Move Left"
                        >
                          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx - 1, "right")}
                          className="p-1 rounded bg-[#24211E] hover:bg-[#3E3A35] text-white"
                          title="Move Right"
                        >
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual URL / Presets Toggle */}
      <div className="pt-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] font-mono text-[#D4A373] hover:text-[#FAF9F6] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showManualInput ? "▲ Hide Studio Presets & Manual URL" : "▼ Or choose from studio presets & paste URL"}</span>
          </button>
        </div>

        {showManualInput && (
          <div className="mt-3 p-3.5 rounded-xl bg-[#161514] border border-[#2A2724] space-y-3 animate-in fade-in duration-200">
            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-mono text-[#706860] uppercase tracking-wider block mb-1.5">
                Curated Studio Presets:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CURATED_IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!primaryImage) onPrimaryImageChange(preset);
                      else if (!galleryImages.includes(preset)) {
                        onGalleryImagesChange([...galleryImages, preset]);
                      }
                    }}
                    className="w-12 h-12 rounded-lg border border-[#2A2724] hover:border-[#D4A373] overflow-hidden shrink-0 relative cursor-pointer transition-colors"
                  >
                    <Image src={preset} alt="preset" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Manual URL input */}
            <div className="flex gap-2 pt-2 border-t border-[#24211E]">
              <input
                type="text"
                placeholder="Paste direct CDN image URL (https://...)"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrl();
                  }
                }}
                className="flex-1 bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3 py-2 text-xs font-mono text-[#FAF9F6] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="px-3 py-2 bg-[#2A2724] hover:bg-[#3E3A35] text-[#FAF9F6] text-xs font-mono rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                + Add URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
