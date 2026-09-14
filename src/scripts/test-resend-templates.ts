import * as fs from "fs";
import * as path from "path";

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
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendStudioBookingEmail,
  sendBespokeInquiryEmail,
} from "../lib/email";

async function runLiveEmailTests() {
  console.log("=== TESTING RESEND TRANSACTIONAL EMAILS WITH REACT-EMAIL ===");
  const testRecipient = "delivered@resend.dev"; // Resend official simulated delivery sink

  // 1. Order Confirmation Email
  console.log("\n1. Testing Order Confirmation Email...");
  const orderRes = await sendOrderConfirmationEmail({
    orderNumber: "ORD-2026-9901",
    customerName: "Maharaja Vikramaditya Singhania",
    customerEmail: testRecipient,
    items: [
      {
        productTitle: "Malabar Teak Monolithic Dining Table",
        timberTitle: "Nilambur 40-Year Seasoned Teak",
        quantity: 1,
        unitPrice: 245000,
        lineTotal: 245000,
      },
      {
        productTitle: "Aura Armchair (Set of 2)",
        timberTitle: "Hand-Burnished Natural Oiled Teak",
        quantity: 2,
        unitPrice: 55000,
        lineTotal: 110000,
      },
    ],
    total: 355000,
    address: "14 Lavelle Road, Richmond Town, Bengaluru, Karnataka - 560001",
    paymentMethod: "Razorpay Secure (Card & NetBanking)",
  });
  console.log("Order Confirmation Result:", orderRes);

  // 2. Order Lifecycle Status Update Email (Workshop Production stage)
  console.log("\n2. Testing Order Lifecycle Status Update Email (Production)...");
  const statusRes = await sendOrderStatusUpdateEmail({
    orderNumber: "ORD-2026-9901",
    customerName: "Maharaja Vikramaditya Singhania",
    customerEmail: testRecipient,
    status: "production",
    items: [
      {
        productTitle: "Malabar Teak Monolithic Dining Table",
        timberTitle: "Nilambur 40-Year Seasoned Teak",
        quantity: 1,
        unitPrice: 245000,
        lineTotal: 245000,
      },
    ],
    total: 355000,
    address: "14 Lavelle Road, Richmond Town, Bengaluru",
    notes: "Mortise-and-tenon structural joints dry-fitted. Hand-planing top slab surfaces underway.",
  });
  console.log("Order Status Update Result (Production):", statusRes);

  // 3. Order Lifecycle Status Update Email (In White-Glove Transit stage)
  console.log("\n3. Testing Order Lifecycle Status Update Email (Dispatched)...");
  const transitRes = await sendOrderStatusUpdateEmail({
    orderNumber: "ORD-2026-9901",
    customerName: "Maharaja Vikramaditya Singhania",
    customerEmail: testRecipient,
    status: "dispatched",
    items: [
      {
        productTitle: "Malabar Teak Monolithic Dining Table",
        timberTitle: "Nilambur 40-Year Seasoned Teak",
        quantity: 1,
        unitPrice: 245000,
        lineTotal: 245000,
      },
    ],
    total: 355000,
    address: "14 Lavelle Road, Richmond Town, Bengaluru",
    notes: "Departed Bangalore atelier via dedicated climate-controlled white-glove transport vehicle.",
  });
  console.log("Order Status Update Result (Dispatched):", transitRes);

  // 4. Studio Walkthrough Booking Confirmation Email
  console.log("\n4. Testing Studio Walkthrough Booking Email...");
  const bookingRes = await sendStudioBookingEmail({
    bookingId: "bk_walkthrough_778899",
    patronName: "Ayesha Rao",
    email: testRecipient,
    phone: "+91 98860 11223",
    studioLocation: "Indiranagar Flagship Atelier, Bengaluru",
    date: "Saturday, 26 September 2026",
    timeSlot: "11:30 AM",
    sessionType: "Architectural Commission & Hardwood Slab Inspection",
    notes: "Reviewing 12-seater conference monolithic slab options and custom brass butterfly keys.",
    status: "confirmed",
  });
  console.log("Studio Walkthrough Booking Result:", bookingRes);

  // 5. Bespoke Inquiry Acknowledgement Email
  console.log("\n5. Testing Bespoke Commission Inquiry Email...");
  const bespokeRes = await sendBespokeInquiryEmail({
    inquiryId: "inq_arch_445566",
    patronName: "Vikramaditya Singhania",
    email: testRecipient,
    phone: "+91 98860 44556",
    projectType: "Executive Penthouse Hardwood Suite",
    timberPreference: "Old-Growth Riverbed Salvaged Teak",
    approxDimensions: "16ft x 5ft custom executive table",
    budgetRange: "₹8,00,000 — ₹12,00,000",
    message: "Hand-pegged joinery with zero synthetic fasteners. Require architect site visit.",
  });
  console.log("Bespoke Commission Inquiry Result:", bespokeRes);

  const allPassed =
    orderRes.success &&
    statusRes.success &&
    transitRes.success &&
    bookingRes.success &&
    bespokeRes.success;

  if (allPassed) {
    console.log("\n🌟 ALL RESEND LUXURY TRANSACTIONAL EMAILS DISPATCHED SUCCESSFULLY!");
  } else {
    console.error("\n❌ Some email dispatches failed.");
    process.exit(1);
  }
}

runLiveEmailTests().catch(err => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
