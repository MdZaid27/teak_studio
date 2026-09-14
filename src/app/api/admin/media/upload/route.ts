import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Returns an S3 client configured for Cloudflare R2 if credentials are set.
 */
function getCloudflareR2Config() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  let bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "teak-haus-media";
  if (bucketName.startsWith('"') && bucketName.endsWith('"')) {
    bucketName = bucketName.slice(1, -1);
  }
  const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || "";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { s3, bucketName, publicDomain };
}

/**
 * POST /api/admin/media/upload
 * Dual-Engine authenticated media uploader:
 * 1. Prioritizes Cloudflare R2 for zero-egress CDN delivery.
 * 2. Gracefully falls back to Supabase Storage 'product-media' bucket.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload." },
        { status: 400 }
      );
    }

    const r2Config = getCloudflareR2Config();
    const adminClient = getSupabaseAdminClient();

    if (!r2Config && !adminClient) {
      return NextResponse.json(
        { success: false, error: "No storage engine available (check R2 or Supabase credentials)." },
        { status: 500 }
      );
    }

    const uploadedUrls: string[] = [];
    let engineUsed = "Supabase Storage";

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File '${file.name}' exceeds the 10MB maximum limit.` },
          { status: 400 }
        );
      }

      const mimeType = file.type || "image/webp";
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          {
            success: false,
            error: `File '${file.name}' has unsupported mime type '${mimeType}'. Supported: PNG, JPEG, WebP, AVIF, GIF.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const originalName = file.name || "image.webp";
      const ext = originalName.split(".").pop()?.toLowerCase() || "webp";
      const cleanBase = originalName
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .slice(0, 30);

      const timestamp = Date.now();
      const randomKey = Math.random().toString(36).slice(2, 8);
      const storageKey = `products/${timestamp}-${cleanBase}-${randomKey}.${ext}`;

      let publicUrl = "";

      // 1. Attempt Cloudflare R2 upload
      if (r2Config) {
        try {
          await r2Config.s3.send(
            new PutObjectCommand({
              Bucket: r2Config.bucketName,
              Key: storageKey,
              Body: buffer,
              ContentType: mimeType,
              CacheControl: "public, max-age=31536000, immutable",
            })
          );

          publicUrl = r2Config.publicDomain
            ? `${r2Config.publicDomain.replace(/\/$/, "")}/${storageKey}`
            : `https://${r2Config.bucketName}.r2.dev/${storageKey}`;
          engineUsed = "Cloudflare R2";
        } catch (r2Err) {
          console.warn("[TEAK HAUS MEDIA] R2 upload error, falling back to Supabase Storage:", r2Err);
        }
      }

      // 2. Fallback to Supabase Storage
      if (!publicUrl && adminClient) {
        const { data: uploadData, error: uploadErr } = await adminClient.storage
          .from("product-media")
          .upload(storageKey, buffer, {
            contentType: mimeType,
            upsert: true,
            cacheControl: "31536000",
          });

        if (uploadErr || !uploadData) {
          console.error("[TEAK HAUS STORAGE ERROR] Supabase upload failed:", uploadErr);
          throw new Error(uploadErr?.message || "Storage upload failed");
        }

        const { data: pubData } = adminClient.storage
          .from("product-media")
          .getPublicUrl(storageKey);

        if (pubData?.publicUrl) {
          publicUrl = pubData.publicUrl;
          engineUsed = "Supabase Storage";
        }
      }

      if (publicUrl) {
        uploadedUrls.push(publicUrl);
      }
    }

    return NextResponse.json(
      {
        success: true,
        urls: uploadedUrls,
        url: uploadedUrls[0] || "",
        count: uploadedUrls.length,
        engine: engineUsed,
        message: `Successfully uploaded ${uploadedUrls.length} image(s) via ${engineUsed}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Media upload failed";
    console.error("[TEAK HAUS MEDIA] POST /api/admin/media/upload error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
