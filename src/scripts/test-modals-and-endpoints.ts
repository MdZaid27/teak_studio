import * as fs from "fs";
import * as path from "path";
import dns from "dns";

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

async function testEndpoints() {
  console.log("=== TESTING STUDIO BOOKING & BESPOKE INQUIRY API ENDPOINTS ===");
  const baseUrl = "http://localhost:3000";

  // 1. Test POST /api/bookings
  console.log("\n1. Testing POST /api/bookings...");
  const bookingPayload = {
    patron_name: "Maharani Gayatri Devi",
    email: "delivered@resend.dev",
    phone: "9820011223",
    studio_location: "Indiranagar Atelier",
    preferred_date: "2026-09-25",
    preferred_time_slot: "11:00 AM",
    notes: "Reviewing 12-seater monolithic dining table specifications.",
  };

  const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingPayload),
  });

  const bookingData = await bookingRes.json();
  console.log("POST /api/bookings Status:", bookingRes.status);
  console.log("POST /api/bookings Response:", bookingData);

  if (bookingRes.ok && bookingData.success && (bookingData.id || bookingData.bookingId)) {
    console.log("✅ [PASS] POST /api/bookings created record with ID:", bookingData.id || bookingData.bookingId);
  } else {
    console.error("❌ [FAIL] POST /api/bookings failed:", bookingData);
    process.exit(1);
  }

  // 2. Test POST /api/bespoke
  console.log("\n2. Testing POST /api/bespoke...");
  const bespokePayload = {
    patron_name: "Vikramaditya Singhania",
    email: "delivered@resend.dev",
    phone: "9876543210",
    project_type: "Custom Dining Statement",
    timber_preference: "Hunsur Teak",
    approx_dimensions: "10ft x 4.5ft single-slab top",
    budget_range: "₹3,00,000 - ₹6,00,000",
    message: "Requesting custom butterfly brass inlays with matte plant-oil finish.",
  };

  const bespokeRes = await fetch(`${baseUrl}/api/bespoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bespokePayload),
  });

  const bespokeData = await bespokeRes.json();
  console.log("POST /api/bespoke Status:", bespokeRes.status);
  console.log("POST /api/bespoke Response:", bespokeData);

  if (bespokeRes.ok && bespokeData.success && (bespokeData.id || bespokeData.inquiryId)) {
    console.log("✅ [PASS] POST /api/bespoke created inquiry with ID:", bespokeData.id || bespokeData.inquiryId);
  } else {
    console.error("❌ [FAIL] POST /api/bespoke failed:", bespokeData);
    process.exit(1);
  }

  // 3. Test Status Updates
  console.log("\n3. Testing Status Updates (Admin Action)...");
  const { updateStudioBookingStatus, getStudioBookingById } = await import("../lib/bookings");
  const { updateBespokeInquiryStatus } = await import("../lib/interactions");

  const bookingId = bookingData.id || bookingData.bookingId;
  const updatedBooking = await updateStudioBookingStatus(bookingId, "confirmed");
  if (updatedBooking.success && updatedBooking.booking?.status === "confirmed") {
    console.log("✅ [PASS] Studio booking status toggled to 'confirmed'");
  } else {
    console.error("❌ [FAIL] Booking status update failed:", updatedBooking);
    process.exit(1);
  }

  const inquiryId = bespokeData.id || bespokeData.inquiryId;
  const updatedInquiry = await updateBespokeInquiryStatus(inquiryId, "contacted");
  if (updatedInquiry && updatedInquiry.status === "contacted") {
    console.log("✅ [PASS] Bespoke inquiry status toggled to 'contacted'");
  } else {
    console.error("❌ [FAIL] Bespoke inquiry status update failed:", updatedInquiry);
    process.exit(1);
  }

  console.log("\n🎉 ALL STUDIO BOOKING & BESPOKE INQUIRY API & STATUS TESTS PASSED!");
}

testEndpoints().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
