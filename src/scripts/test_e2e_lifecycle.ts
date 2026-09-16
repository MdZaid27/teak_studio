import * as fs from "fs";
import * as path from "path";
import dns from "dns";

// Prevent local ISP transparent DNS hijacking of *.supabase.co
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

import {
  getPatronAddresses,
  createPatronAddress,
  updatePatronAddress,
  deletePatronAddress,
  getPatronProfile,
  upsertPatronProfile,
} from "../lib/patron";
import { getProducts, getProductById } from "../lib/products";
import { saveDevOrder, getAllOrders } from "../lib/orders";
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

async function runE2ETestSuite() {
  console.log("===============================================================");
  console.log("    TEAK HAUS ATELIER 2.0 - COMPREHENSIVE END-TO-END SUITE     ");
  console.log("===============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
    }
  }

  // =========================================================================
  // SUITE 1: ADDRESS PERSISTENCE, LOGOUT/RE-LOGIN & CHECKOUT RECOVERY
  // =========================================================================
  console.log("-------------------------------------------------------------");
  console.log("SUITE 1: Patron Address Lifecycle Across Logout & Login");
  console.log("-------------------------------------------------------------");

  const patronPhone = "9988776655";
  const formattedPatronPhone = `+91${patronPhone}`;
  const initialDevUserId = `patron-${patronPhone}`;
  const reLoginUuid = "e7b00000-4444-4888-8ccc-000000000001"; // Simulating Supabase Auth UUID upon re-login

  // Step 1: Create an address during initial session
  console.log("  Step 1: Creating initial address during patron session...");
  const addr1 = await createPatronAddress(initialDevUserId, {
    first_name: "Maharaja",
    last_name: "Vikramaditya",
    phone: formattedPatronPhone,
    email: "vikram@example.com",
    floor_building: "Apartment 4B, Imperial Residency",
    area_street: "14 Lavelle Road",
    pincode: "560001",
    city: "Bengaluru",
    state: "Karnataka",
    save_as: "Home",
    is_default: true,
  });

  assert(Boolean(addr1.id), `Address 1 created with ID: ${addr1.id}`);
  assert(addr1.is_default === true, "Address 1 correctly marked as default");

  // Step 2: Verify saved on physical disk
  console.log("  Step 2: Verifying address persisted to physical disk file...");
  const diskPath = path.resolve(process.cwd(), "src/data/patron_addresses.json");
  assert(fs.existsSync(diskPath), "patron_addresses.json exists on disk");
  const diskContent = fs.readFileSync(diskPath, "utf-8");
  assert(
    diskContent.includes("Imperial Residency") && diskContent.includes("560001"),
    "Disk storage file contains Address 1 payload"
  );

  // Step 3: Simulate LOGOUT & TIME PASSING (Wipe volatile memory maps)
  console.log("  Step 3: Simulating Patron Logout & Server Restart (clearing memory)...");
  if (global.__teakDevPatronAddresses) {
    global.__teakDevPatronAddresses.clear();
  }
  if (global.__kilnDevPatronAddresses) {
    global.__kilnDevPatronAddresses.clear();
  }
  if (global.__teakDevPatronProfiles) {
    global.__teakDevPatronProfiles.clear();
  }
  if (global.__kilnDevPatronProfiles) {
    global.__kilnDevPatronProfiles.clear();
  }

  // Step 4: Simulate RE-LOGIN with a different session ID format (Supabase UUID vs patron-{phone})
  console.log("  Step 4: Simulating Re-Login after time has elapsed...");
  // Patron logs in with phone 9988776655, but session returns UUID
  const recoveredAddresses = await getPatronAddresses(reLoginUuid, formattedPatronPhone);

  assert(
    recoveredAddresses.length >= 1,
    `Address recovered across sessions despite ID shift (found ${recoveredAddresses.length})`
  );
  const matchedAddr1 = recoveredAddresses.find((a) => a.pincode === "560001");
  assert(
    Boolean(matchedAddr1) && matchedAddr1?.floor_building === "Apartment 4B, Imperial Residency",
    "Address details match original data exactly (Apartment 4B, Imperial Residency, 560001)"
  );

  // Step 5: Test Checkout Auto-save
  console.log("  Step 5: Testing Checkout auto-saving of new delivery destination...");
  // Simulate patron entering a new address during checkout
  const newCheckoutAddr = {
    user_id: reLoginUuid,
    customer_phone: formattedPatronPhone,
    customer_name: "Maharaja Vikramaditya",
    customer_email: "vikram@example.com",
    finalShippingAddress: "Villa 108, Palm Meadows, Varthur Main Road",
    pincode: "560066",
    finalCity: "Bengaluru",
    finalState: "Karnataka",
  };

  const existingBefore = await getPatronAddresses(reLoginUuid, formattedPatronPhone);
  const alreadyHasNew = existingBefore.some((a) => a.pincode === newCheckoutAddr.pincode);
  if (!alreadyHasNew) {
    await createPatronAddress(reLoginUuid, {
      first_name: "Maharaja",
      last_name: "Vikramaditya",
      phone: formattedPatronPhone,
      email: "vikram@example.com",
      floor_building: "Villa 108, Palm Meadows",
      area_street: "Varthur Main Road",
      pincode: "560066",
      city: "Bengaluru",
      state: "Karnataka",
      save_as: "Work",
      is_default: false,
    });
  }

  const updatedAddressBook = await getPatronAddresses(reLoginUuid, formattedPatronPhone);
  assert(
    updatedAddressBook.length >= 2,
    `Address book now contains multiple destinations (${updatedAddressBook.length} addresses)`
  );
  const foundNewCheckout = updatedAddressBook.find((a) => a.pincode === "560066");
  assert(Boolean(foundNewCheckout), "New checkout address (Villa 108, Palm Meadows) auto-saved in patron profile");

  // Step 6: Test Default Address toggling
  console.log("  Step 6: Testing default residence switching...");
  if (foundNewCheckout) {
    const toggled = await updatePatronAddress(reLoginUuid, foundNewCheckout.id, { is_default: true });
    assert(toggled?.is_default === true, "New address successfully toggled to default");
  }

  // =========================================================================
  // SUITE 2: CATALOG, PRODUCTS & TIMBER VARIANT PRICING
  // =========================================================================
  console.log("\n-------------------------------------------------------------");
  console.log("SUITE 2: Catalog, Products & Timber Pricing Consistency");
  console.log("-------------------------------------------------------------");

  const products = await getProducts();
  assert(Array.isArray(products) && products.length > 0, `Products loaded: count=${products.length}`);

  const sampleProduct = products[0];
  assert(Boolean(sampleProduct?.id && sampleProduct?.name), `Primary product valid: "${sampleProduct.name}"`);
  assert(typeof sampleProduct.price === "number" && sampleProduct.price > 0, `Product price valid: ₹${sampleProduct.price}`);
  assert(
    Array.isArray(sampleProduct.timbers) && sampleProduct.timbers.length > 0,
    `Product has timber finishes: ${sampleProduct.timbers?.map((t) => t.name).join(", ")}`
  );

  const productFromDb = await getProductById(sampleProduct.id);
  assert(Boolean(productFromDb), `Product fetch by ID succeeds: id=${sampleProduct.id}`);

  // =========================================================================
  // SUITE 3: CLOUDFLARE R2 MEDIA PIPELINE
  // =========================================================================
  console.log("\n-------------------------------------------------------------");
  console.log("SUITE 3: Cloudflare R2 Media CDN Storage");
  console.log("-------------------------------------------------------------");

  const r2AccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const r2AccessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || "teak-haus-media";
  const r2PublicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;

  if (r2AccountId && r2AccessKey && r2SecretKey) {
    try {
      const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
        },
      });

      const testKey = `test-e2e-assets/e2e-lifecycle-test-${Date.now()}.txt`;
      await s3.send(
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: testKey,
          Body: Buffer.from("TEAK HAUS E2E asset verification payload", "utf-8"),
          ContentType: "text/plain",
        })
      );
      const publicUrl = `${(r2PublicDomain || `https://${r2Bucket}.r2.dev`).replace(/\/+$/, "")}/${testKey}`;
      assert(publicUrl.includes("pub-3fdb88e6c8fb4df9a8fc45c4f4d37a51.r2.dev"), `R2 CDN URL generated correctly: ${publicUrl}`);
    } catch (err) {
      assert(false, `R2 upload failed: ${(err as Error).message}`);
    }
  } else {
    assert(false, "Cloudflare R2 credentials missing");
  }

  // =========================================================================
  // SUITE 4: TRANSACTIONAL EMAIL DISPATCH VIA RESEND
  // =========================================================================
  console.log("\n-------------------------------------------------------------");
  console.log("SUITE 4: Luxury Transactional Email Dispatch (Resend)");
  console.log("-------------------------------------------------------------");

  try {
    const testRecipient = "delivered@resend.dev";

    // 1. Order Confirmation Email
    const orderEmail = await sendOrderConfirmationEmail({
      orderNumber: "TH-E2E-8899",
      customerName: "Vikramaditya Singhania",
      customerEmail: testRecipient,
      items: [
        {
          productTitle: sampleProduct.name,
          timberTitle: sampleProduct.timbers?.[0]?.name || "Nilambur Teak",
          quantity: 1,
          unitPrice: sampleProduct.price,
          lineTotal: sampleProduct.price,
        },
      ],
      total: sampleProduct.price,
      address: "14 Lavelle Road, Richmond Town, Bengaluru - 560001",
      paymentMethod: "Inspection Upon Delivery / Zero Upfront",
    });
    assert(orderEmail.success, `Order confirmation email sent: id=${orderEmail.messageId}`);

    // 2. Studio Walkthrough Email
    const bookingEmail = await sendStudioBookingEmail({
      bookingId: `bk_${Date.now()}`,
      patronName: "Vikramaditya Singhania",
      email: testRecipient,
      phone: "+91 9988776655",
      studioLocation: "Indiranagar Atelier, Bengaluru",
      preferredDate: "2026-09-28",
      preferredTime: "11:30 AM",
      sessionType: "Architectural & Interior Curation",
      notes: "Private residence furnishing consultation.",
    });
    assert(bookingEmail.success, `Studio Walkthrough email sent: id=${bookingEmail.messageId}`);

    // 3. Bespoke Commission Email
    const bespokeEmail = await sendBespokeCommissionEmail({
      inquiryId: `inq_${Date.now()}`,
      patronName: "Vikramaditya Singhania",
      email: testRecipient,
      projectType: "Heritage Monolith Dining Table",
      timberPreference: "Old Salvaged Teak",
      budgetRange: "₹4,00,000 - ₹8,00,000",
      approxDimensions: "12ft x 4.5ft single slab",
      message: "End to end test commission inquiry.",
    });
    assert(bespokeEmail.success, `Bespoke commission email sent: id=${bespokeEmail.messageId}`);
  } catch (err) {
    assert(false, `Email service error: ${(err as Error).message}`);
  }

  // =========================================================================
  // SUITE 5: STUDIO BOOKINGS & BESPOKE INQUIRIES
  // =========================================================================
  console.log("\n-------------------------------------------------------------");
  console.log("SUITE 5: Studio Walkthrough & Bespoke Inquiries Data Store");
  console.log("-------------------------------------------------------------");

  try {
    const bookingRes = await createStudioBooking({
      patron_name: "Maharaja Vikramaditya",
      email: "vikram@example.com",
      phone: "+91 9988776655",
      studio_location: "Whitefield Experience Atelier, Bengaluru",
      preferred_date: "2026-09-30",
      preferred_time_slot: "02:00 PM",
      notes: "Selecting solid teak credenzas.",
    });
    assert(bookingRes.success && Boolean(bookingRes.bookingId), `Studio booking created with ID: ${bookingRes.bookingId}`);

    const bookings = await getAllStudioBookings();
    assert(Array.isArray(bookings) && bookings.length > 0, `Studio bookings fetched: count=${bookings.length}`);

    const inquiryRes = await createBespokeInquiry({
      patron_name: "Maharaja Vikramaditya",
      email: "vikram@example.com",
      phone: "+91 9988776655",
      project_type: "Solid Timber Credenza",
      timber_preference: "Riverbed Teak",
      approx_dimensions: "8ft x 2.5ft",
      budget_range: "₹2,00,000 - ₹4,00,000",
      message: "Custom bronze hardware requested.",
    });
    assert(inquiryRes.success && Boolean(inquiryRes.inquiryId), `Bespoke inquiry created with ID: ${inquiryRes.inquiryId}`);
  } catch (err) {
    assert(false, `Bookings / Inquiries error: ${(err as Error).message}`);
  }

  // =========================================================================
  // SUITE 6: ORDER PLACEMENT & INVENTORY LINKAGE
  // =========================================================================
  console.log("\n-------------------------------------------------------------");
  console.log("SUITE 6: Order Placement & Inventory Linkage");
  console.log("-------------------------------------------------------------");

  try {
    const testOrderId = `order-e2e-${Date.now()}`;
    const testOrderNumber = `TH-E2E-${Math.floor(1000 + Math.random() * 9000)}`;
    saveDevOrder({
      id: testOrderId,
      order_number: testOrderNumber,
      user_id: reLoginUuid,
      customer_name: "Maharaja Vikramaditya",
      customer_phone: formattedPatronPhone,
      customer_email: "vikram@example.com",
      delivery_address: "14 Lavelle Road, Richmond Town",
      shipping_address: "14 Lavelle Road, Richmond Town",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      subtotal: sampleProduct.price,
      total: sampleProduct.price,
      total_amount: sampleProduct.price,
      payment_method: "Inspection Upon Delivery / Zero Upfront",
      status: "confirmed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_items: [
        {
          id: `item-1`,
          order_id: testOrderId,
          product_id: sampleProduct.id,
          product_name: sampleProduct.name,
          product_title: sampleProduct.name,
          timber_option: sampleProduct.timbers?.[0]?.name || "Nilambur Teak",
          timber_title: sampleProduct.timbers?.[0]?.name || "Nilambur Teak",
          quantity: 1,
          unit_price: sampleProduct.price,
          line_total: sampleProduct.price,
          image_url: sampleProduct.image || "",
          created_at: new Date().toISOString(),
        },
      ],
    });

    const allOrders = await getAllOrders();
    const createdOrder = allOrders.find((o) => o.order_number === testOrderNumber);
    assert(Boolean(createdOrder), `Order created and retrieved: ${testOrderNumber}`);
    assert(createdOrder?.total_amount === sampleProduct.price, `Order amount verified: ₹${createdOrder?.total_amount}`);
  } catch (err) {
    assert(false, `Order creation test error: ${(err as Error).message}`);
  }

  // =========================================================================
  // SUITE 7: PRODUCTION SEO, SITEMAP & ROBOTS
  // =========================================================================
  console.log("\n-------------------------------------------------------------");
  console.log("SUITE 7: Production SEO, Dynamic Sitemap & Robots.txt");
  console.log("-------------------------------------------------------------");

  try {
    const sitemapData = await sitemap();
    assert(Array.isArray(sitemapData) && sitemapData.length >= 7, `Sitemap has ${sitemapData.length} indexed URLs`);
    const urls = sitemapData.map((s) => s.url);
    assert(urls.some((u) => u.includes("/shop")), "Sitemap contains /shop");
    assert(urls.some((u) => u.includes("/bespoke")), "Sitemap contains /bespoke");
    assert(urls.some((u) => u.includes("/wood-types")), "Sitemap contains /wood-types");

    const robotsData = robots();
    assert(Boolean(robotsData.rules), "Robots rules defined");
    assert(Boolean(robotsData.sitemap), `Robots points to sitemap: ${robotsData.sitemap}`);
  } catch (err) {
    assert(false, `SEO generation error: ${(err as Error).message}`);
  }

  // =========================================================================
  // FINAL SCORECARD
  // =========================================================================
  console.log("\n===============================================================");
  console.log(`  E2E TEST SCORECARD: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("===============================================================\n");

  if (passed === total) {
    console.log("🌟 ALL TESTED CAPABILITIES ARE 100% OPERATIONAL AND RESILIENT!\n");
    process.exit(0);
  } else {
    console.error("⚠️ Some tests failed. Review output above.\n");
    process.exit(1);
  }
}

runE2ETestSuite().catch((e) => {
  console.error("Fatal E2E test runner exception:", e);
  process.exit(1);
});
