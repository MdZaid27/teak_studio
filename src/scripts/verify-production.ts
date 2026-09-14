import * as fs from "fs";
import * as path from "path";
import dns from "dns";

// Server-side safeguard: Prevent local ISP transparent DNS hijacking of *.supabase.co
if (dns && typeof dns.lookup === "function") {
  const originalLookup = dns.lookup.bind(dns);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dns.lookup = ((hostname: string, options: any, callback: any) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (typeof hostname === "string" && hostname.endsWith(".supabase.co")) {
      if (options && options.all) {
        return callback(null, [
          { address: "172.64.149.246", family: 4 },
          { address: "104.18.38.10", family: 4 },
        ]);
      }
      return callback(null, "172.64.149.246", 4);
    }
    return originalLookup(hostname, options, callback);
  }) as typeof dns.lookup;
}

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  sendOrderConfirmationEmail,
  sendStudioBookingEmail,
  sendBespokeCommissionEmail,
} from "../lib/email";
import {
  createStudioBooking,
  getAllStudioBookings,
} from "../lib/bookings";
import { createBespokeInquiry } from "../lib/interactions";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

async function runVerification() {
  console.log("=== TEAK HAUS PRODUCTION SUITE VERIFICATION ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  // 1. Cloudflare R2 Upload Test
  console.log("\n--- 1. Testing Cloudflare R2 Media Upload ---");
  const r2AccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const r2AccessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || "teak-haus-media";
  const r2PublicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;

  if (r2AccountId && r2AccessKey && r2SecretKey) {
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    const testKey = `catalog-products/test-verify-${Date.now()}.txt`;
    const testContent = Buffer.from("TEAK HAUS verified test asset payload", "utf-8");

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: testKey,
          Body: testContent,
          ContentType: "text/plain",
        })
      );
      const publicUrl = `${(r2PublicDomain || `https://${r2Bucket}.r2.dev`).replace(/\/+$/, "")}/${testKey}`;
      assert(publicUrl.includes("pub-3fdb88e6c8fb4df9a8fc45c4f4d37a51.r2.dev"), `R2 Upload generated valid CDN URL: ${publicUrl}`);
    } catch (err) {
      assert(false, `R2 upload failed: ${(err as Error).message}`);
    }
  } else {
    assert(false, "Cloudflare R2 credentials missing in environment");
  }

  // 2. Transactional Email Dispatch Test
  console.log("\n--- 2. Testing Transactional Email Dispatch ---");
  try {
    const testRecipient = process.env.RESEND_API_KEY ? "delivered@resend.dev" : "patron@example.com";

    const orderRes = await sendOrderConfirmationEmail({
      orderNumber: "ORD-TEST-998811",
      customerName: "Maharaja Vikramaditya",
      customerEmail: testRecipient,
      items: [
        {
          productTitle: "Malabar Teak Dining Table",
          timberTitle: "Nilambur Grade-A Teak",
          quantity: 1,
          unitPrice: 185000,
          lineTotal: 185000,
        },
        {
          productTitle: "Aura Armchair",
          timberTitle: "Natural Oiled Teak",
          quantity: 2,
          unitPrice: 45000,
          lineTotal: 90000,
        },
      ],
      total: 275000,
      address: "14 Lavelle Road, Richmond Town, Bengaluru, Karnataka - 560001",
      paymentMethod: "Razorpay Secure / Card",
    });
    assert(orderRes.success, `Order confirmation dispatch handled: id=${orderRes.messageId || "dev-logged"}`);

    const bookingRes = await sendStudioBookingEmail({
      bookingId: "bk_test_445522",
      patronName: "Ayesha Rao",
      email: testRecipient,
      phone: "+91 98888 12345",
      studioLocation: "Indiranagar Atelier, Bengaluru",
      preferredDate: "2026-09-20",
      preferredTime: "11:30 AM",
      sessionType: "Bespoke Architectural Consultation",
      notes: "Seeking full teak interior furnishing for 4BHK villa.",
    });
    assert(bookingRes.success, `Studio Walkthrough booking dispatch handled: id=${bookingRes.messageId || "dev-logged"}`);

    const bespokeRes = await sendBespokeCommissionEmail({
      inquiryId: "inq_test_112233",
      patronName: "Vikramaditya Singhania",
      email: testRecipient,
      projectType: "Executive Boardroom Suite",
      timberPreference: "Salvaged Old Teak",
      budgetRange: "₹5,00,000 - ₹10,00,000",
      approxDimensions: "14ft x 5ft monolithic slab",
      message: "Commissioning for heritage headquarters.",
    });
    assert(bespokeRes.success, `Bespoke commission dispatch handled: id=${bespokeRes.messageId || "dev-logged"}`);
  } catch (err) {
    assert(false, `Email dispatch error: ${(err as Error).message}`);
  }

  // 3. Studio Bookings Service Test
  console.log("\n--- 3. Testing Studio Bookings Service ---");
  try {
    const booking = await createStudioBooking({
      patron_name: "Kavya Menon",
      email: "kavya@example.com",
      phone: "+91 97777 66554",
      studio_location: "Whitefield Experience Center, Bengaluru",
      preferred_date: "2026-09-25",
      preferred_time_slot: "03:00 PM",
      notes: "Interested in bespoke credenza designs.",
    });
    assert(booking.success && Boolean(booking.bookingId), `Studio booking created successfully with ID: ${booking.bookingId}`);

    const allBookings = await getAllStudioBookings();
    assert(Array.isArray(allBookings) && allBookings.length > 0, `Studio bookings retrieval succeeded: ${allBookings.length} bookings found`);
  } catch (err) {
    assert(false, `Studio Bookings service error: ${(err as Error).message}`);
  }

  // 4. Bespoke Inquiries Service Test
  console.log("\n--- 4. Testing Bespoke Inquiries Service ---");
  try {
    const inquiry = await createBespokeInquiry({
      patron_name: "Aditya Roy",
      email: "aditya@example.com",
      phone: "+91 98800 11223",
      project_type: "Dining Suite",
      timber_preference: "Riverbed Seasoned Teak",
      approx_dimensions: "8-seater 8ft x 3.5ft",
      budget_range: "₹2,50,000 - ₹5,00,000",
      message: "Requesting custom butterfly brass inlays.",
    });
    assert(inquiry.success && Boolean(inquiry.inquiryId), `Bespoke commission inquiry created with ID: ${inquiry.inquiryId}`);
  } catch (err) {
    assert(false, `Bespoke Inquiry service error: ${(err as Error).message}`);
  }

  // 5. SEO & Metadata Verification
  console.log("\n--- 5. Testing Production SEO (Sitemap & Robots) ---");
  try {
    const sitemapEntries = await sitemap();
    assert(Array.isArray(sitemapEntries) && sitemapEntries.length >= 7, `Sitemap generated ${sitemapEntries.length} entries`);
    const urls = sitemapEntries.map(e => e.url);
    assert(urls.some(u => u.includes("/bespoke")), "Sitemap contains /bespoke route");
    assert(urls.some(u => u.includes("/shop")), "Sitemap contains /shop route");
    assert(urls.some(u => u.includes("/wood-types")), "Sitemap contains /wood-types route");
    assert(urls.some(u => u.includes("/provenance")), "Sitemap contains /provenance route");
    assert(urls.some(u => u.includes("/story")), "Sitemap contains /story route");

    const robotsRules = robots();
    assert(Boolean(robotsRules.rules), "Robots rules defined");
    assert(Boolean(robotsRules.sitemap), `Robots points to sitemap: ${robotsRules.sitemap}`);
  } catch (err) {
    assert(false, `SEO generation error: ${(err as Error).message}`);
  }

  console.log(`\n========================================`);
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================`);

  if (passed === total) {
    console.log("🌟 ALL PRODUCTION SYSTEMS NOMINAL AND VERIFIED!");
    process.exit(0);
  } else {
    console.error("⚠️ Some checks failed.");
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
