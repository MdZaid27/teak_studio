import * as React from "react";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { OrderStatusUpdateEmail } from "@/emails/OrderStatusUpdateEmail";
import { StudioBookingEmail } from "@/emails/StudioBookingEmail";
import { BespokeInquiryEmail } from "@/emails/BespokeInquiryEmail";
import { CustomerOtpEmail } from "@/emails/CustomerOtpEmail";
import { OrderStatus } from "@/types/database";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Retrieve normalized sender email address from environment.
 */
function getSenderEmail(): string {
  const raw = process.env.EMAIL_FROM || "TEAK HAUS Atelier <onboarding@resend.dev>";
  const cleaned = raw.split("#")[0].trim().replace(/^["']|["']$/g, "");
  return cleaned || "TEAK HAUS Atelier <onboarding@resend.dev>";
}

/**
 * Initialize Resend client if API key is provided.
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "invalid" || apiKey.trim() === "") return null;
  return new Resend(apiKey);
}

/**
 * Dispatch an email via the official Resend SDK or fallback to development logger.
 */
async function dispatchEmail(payload: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  const from = getSenderEmail();

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      if (error) {
        // Handle Resend free-tier sandbox restrictions in development only:
        const isProduction = process.env.NODE_ENV === "production";
        const isSandboxBlock =
          !isProduction &&
          (error.message?.includes("You can only send testing emails to your own email address") ||
           error.message?.includes("Invalid `to` field") ||
           error.message?.includes("testing email address"));

        if (isSandboxBlock) {
          const match = error.message?.match(/\(([^)]+)\)/);
          const ownerEmail = match ? match[1] : "mzaid6048@gmail.com";
          console.warn(
            `[TEAK HAUS EMAIL NOTICE] Resend sandbox restriction in development: Recipient "${payload.to}" cannot receive emails on free onboarding domain. Re-routing test email to verified account owner (${ownerEmail}).`
          );
          const retry = await resend.emails.send({
            from,
            to: ownerEmail,
            subject: `[TEST FOR: ${payload.to}] ${payload.subject}`,
            html: payload.html,
          });

          if (retry.data?.id) {
            console.log(
              `[TEAK HAUS EMAIL] Dispatched re-routed sandbox email to ${ownerEmail}, id: ${retry.data.id}`
            );
            return { success: true, messageId: retry.data.id };
          }
        }

        console.warn("[TEAK HAUS EMAIL] Resend returned error:", error);
        return { success: false, error: error.message };
      }

      console.log(`[TEAK HAUS EMAIL] Dispatched to ${payload.to}, id: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (err: unknown) {
      console.error("[TEAK HAUS EMAIL] Error dispatching via Resend SDK:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Dispatch error",
      };
    }
  }

  // Development simulation logging
  console.log("------------------------------------------------------------");
  console.log(`[TEAK HAUS EMAIL SIMULATION] To: ${payload.to}`);
  console.log(`[TEAK HAUS EMAIL SIMULATION] Subject: ${payload.subject}`);
  console.log("------------------------------------------------------------");

  return { success: true, simulated: true };
}

/**
 * 1. Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productTitle?: string | null;
    productName?: string | null;
    timberTitle?: string | null;
    timberOption?: string | null;
    quantity: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  total: number;
  address: string;
  paymentMethod?: string;
  orderUrl?: string;
}): Promise<EmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teakhaus.in";
  const orderUrl = order.orderUrl || `${siteUrl}/orders/${order.orderNumber}`;

  const reactElement = React.createElement(OrderConfirmationEmail, {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    total: order.total,
    address: order.address,
    paymentMethod: order.paymentMethod,
    orderUrl,
  });

  const html = await render(reactElement);

  return dispatchEmail({
    to: order.customerEmail,
    subject: `Acquisition Confirmed: Order #${order.orderNumber} — TEAK HAUS`,
    html,
  });
}

/**
 * 2. Lifecycle Status Update Email (Production, Dispatched, Delivered, Cancelled)
 */
export async function sendOrderStatusUpdateEmail(update: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items?: Array<{
    productTitle?: string | null;
    productName?: string | null;
    timberTitle?: string | null;
    timberOption?: string | null;
    quantity: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  total?: number;
  address?: string;
  orderUrl?: string;
  notes?: string;
}): Promise<EmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teakhaus.in";
  const orderUrl = update.orderUrl || `${siteUrl}/orders/${update.orderNumber}`;

  const reactElement = React.createElement(OrderStatusUpdateEmail, {
    orderNumber: update.orderNumber,
    customerName: update.customerName,
    customerEmail: update.customerEmail,
    status: update.status,
    items: update.items,
    total: update.total,
    address: update.address,
    orderUrl,
    statusNotes: update.notes,
  });

  const html = await render(reactElement);

  const statusLabel =
    update.status === "production"
      ? "Workshop Joinery in Progress"
      : update.status === "dispatched"
      ? "In White-Glove Transit"
      : update.status === "delivered"
      ? "Delivered & Leveled"
      : update.status === "confirmed"
      ? "Grain Verified & Reserved"
      : update.status.toUpperCase();

  return dispatchEmail({
    to: update.customerEmail,
    subject: `Order #${update.orderNumber} Update: ${statusLabel} — TEAK HAUS`,
    html,
  });
}

/**
 * 3. Studio Walkthrough Booking Confirmation & Status Email
 */
export async function sendStudioBookingEmail(booking: {
  bookingId: string;
  patronName: string;
  email?: string;
  patronEmail?: string;
  phone?: string;
  patronPhone?: string;
  location?: string;
  studioLocation?: string;
  date?: string;
  preferredDate?: string;
  timeSlot?: string;
  preferredTime?: string;
  sessionType?: string;
  notes?: string | null;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
}): Promise<EmailResult> {
  const recipientEmail = booking.email || booking.patronEmail || "";
  const location = booking.location || booking.studioLocation || "Indiranagar Atelier, Bengaluru";
  const date = booking.date || booking.preferredDate || "To be coordinated";
  const timeSlot = booking.timeSlot || booking.preferredTime || "Flexible";

  const reactElement = React.createElement(StudioBookingEmail, {
    bookingId: booking.bookingId,
    patronName: booking.patronName,
    patronEmail: recipientEmail,
    patronPhone: booking.phone || booking.patronPhone,
    studioLocation: location,
    preferredDate: date,
    preferredTimeSlot: timeSlot,
    sessionType: booking.sessionType,
    notes: booking.notes,
    status: booking.status || "confirmed",
  });

  const html = await render(reactElement);

  return dispatchEmail({
    to: recipientEmail,
    subject: `Studio Walkthrough Scheduled: ${location} — TEAK HAUS`,
    html,
  });
}

/**
 * 4. Bespoke Commission Inquiry Acknowledgement Email
 */
export async function sendBespokeInquiryEmail(inquiry: {
  inquiryId: string;
  patronName: string;
  email?: string;
  patronEmail?: string;
  phone?: string;
  patronPhone?: string;
  projectType: string;
  timberPreference: string;
  approxDimensions?: string | null;
  budgetRange?: string | null;
  message: string;
}): Promise<EmailResult> {
  const recipientEmail = inquiry.email || inquiry.patronEmail || "";

  const reactElement = React.createElement(BespokeInquiryEmail, {
    inquiryId: inquiry.inquiryId,
    patronName: inquiry.patronName,
    patronEmail: recipientEmail,
    patronPhone: inquiry.phone || inquiry.patronPhone,
    projectType: inquiry.projectType,
    timberPreference: inquiry.timberPreference,
    approxDimensions: inquiry.approxDimensions,
    budgetRange: inquiry.budgetRange,
    message: inquiry.message,
  });

  const html = await render(reactElement);

  return dispatchEmail({
    to: recipientEmail,
    subject: `Commission Brief Acknowledged: ${inquiry.projectType} — TEAK HAUS`,
    html,
  });
}

export const sendBespokeCommissionEmail = sendBespokeInquiryEmail;

/**
 * 5. Patron Authentication Access Pass (OTP) Email
 */
export async function sendCustomerOtpEmail(payload: {
  email: string;
  otpCode: string;
  phone?: string;
  customerName?: string;
  expiryMinutes?: number;
}): Promise<EmailResult> {
  const reactElement = React.createElement(CustomerOtpEmail, {
    otpCode: payload.otpCode,
    patronName: payload.customerName,
    phone: payload.phone,
    expiryMinutes: payload.expiryMinutes || 10,
  });

  const html = await render(reactElement);

  return dispatchEmail({
    to: payload.email,
    subject: `Your Atelier Access Pass: ${payload.otpCode} — TEAK HAUS`,
    html,
  });
}
