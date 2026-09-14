import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Hr,
  Preview,
} from "@react-email/components";
import { OrderStatus } from "@/types/database";

export interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
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
  statusNotes?: string;
}

const STATUS_DETAILS: Record<
  OrderStatus,
  {
    badge: string;
    headline: string;
    description: string;
    accentColor: string;
    stepIndex: number;
  }
> = {
  pending: {
    badge: "PAYMENT VERIFICATION",
    headline: "Order Placed — Pending Verification",
    description: "Your order has been recorded and is undergoing payment and timber stock verification.",
    accentColor: "#D4A373",
    stepIndex: 0,
  },
  confirmed: {
    badge: "GRAIN ALLOCATED",
    headline: "Acquisition Confirmed & Timber Reserved",
    description:
      "Our timber curators have inspected and reserved the heartwood planks for your order. Your piece is now queued for precision joinery.",
    accentColor: "#38BDF8",
    stepIndex: 1,
  },
  production: {
    badge: "WORKSHOP CRAFTING",
    headline: "Hand-Pegged Joinery in Progress",
    description:
      "Master joiners are currently hand-cutting mortise-and-tenon joints, planing solid teak surfaces, and applying deep organic oil finishes to your piece.",
    accentColor: "#F59E0B",
    stepIndex: 2,
  },
  dispatched: {
    badge: "WHITE-GLOVE TRANSIT",
    headline: "En Route via Climate-Controlled Transit",
    description:
      "Your piece has departed our Bangalore atelier. A specialized two-person white-glove logistics team will contact you prior to delivery for room placement.",
    accentColor: "#818CF8",
    stepIndex: 3,
  },
  delivered: {
    badge: "DELIVERED & LEVELED",
    headline: "Delivered to Your Residence",
    description:
      "White-glove placement and leveling has been concluded. Your heirloom solid hardwood piece is now home, ready to age with natural patina for generations.",
    accentColor: "#10B981",
    stepIndex: 4,
  },
  cancelled: {
    badge: "ORDER VOIDED",
    headline: "Order Cancellation Notice",
    description:
      "Your order has been cancelled and timber allocations have been released back to our studio reserves.",
    accentColor: "#EF4444",
    stepIndex: -1,
  },
};

export function OrderStatusUpdateEmail({
  orderNumber = "ORD-2026-8891",
  customerName = "Maharaja Vikramaditya",
  status = "production",
  items = [
    {
      productTitle: "Malabar Teak Dining Table",
      timberTitle: "Nilambur Grade-A Teak",
      quantity: 1,
      unitPrice: 185000,
      lineTotal: 185000,
    },
  ],
  total = 185000,
  address = "14 Lavelle Road, Richmond Town, Bengaluru",
  orderUrl = "https://teakhaus.in/orders/ORD-2026-8891",
  statusNotes,
}: OrderStatusUpdateEmailProps) {
  const currentStatusInfo = STATUS_DETAILS[status] || STATUS_DETAILS.confirmed;
  const isCancelled = status === "cancelled";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        Order #{orderNumber} Status Update: {currentStatusInfo.headline} — TEAK HAUS
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Heading style={brandHeadingStyle}>TEAK HAUS</Heading>
            <Text style={brandSubtitleStyle}>
              SOLID HARDWOOD &amp; HEIRLOOM JOINERY • BENGALURU
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSectionStyle}>
            <div style={badgeWrapperStyle}>
              <span
                style={{
                  ...badgeStyle,
                  borderColor: currentStatusInfo.accentColor,
                  color: currentStatusInfo.accentColor,
                }}
              >
                {currentStatusInfo.badge}
              </span>
            </div>

            <Heading as="h2" style={greetingHeadingStyle}>
              {currentStatusInfo.headline}
            </Heading>
            <Text style={introTextStyle}>Dear {customerName},</Text>
            <Text style={bodyTextStyle}>
              {statusNotes || currentStatusInfo.description}
            </Text>

            {/* Lifecycle Pipeline Progress Indicator */}
            {!isCancelled && (
              <Section style={pipelineSectionStyle}>
                <Row style={{ textAlign: "center" }}>
                  {[
                    { label: "Confirmed", step: 1 },
                    { label: "Workshop", step: 2 },
                    { label: "In Transit", step: 3 },
                    { label: "Delivered", step: 4 },
                  ].map((s, idx) => {
                    const isCompleted = currentStatusInfo.stepIndex >= s.step;
                    const isCurrent = currentStatusInfo.stepIndex === s.step;

                    return (
                      <Column key={idx} style={{ width: "25%", padding: "0 4px" }}>
                        <div
                          style={{
                            height: "4px",
                            backgroundColor: isCurrent
                              ? currentStatusInfo.accentColor
                              : isCompleted
                              ? "#D4A373"
                              : "#2E2B27",
                            borderRadius: "2px",
                            marginBottom: "6px",
                          }}
                        />
                        <Text
                          style={{
                            fontSize: "9px",
                            fontFamily: "monospace",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: isCurrent
                              ? currentStatusInfo.accentColor
                              : isCompleted
                              ? "#FAF9F6"
                              : "#706860",
                            fontWeight: isCurrent ? "bold" : "normal",
                            margin: "0",
                          }}
                        >
                          {s.label}
                        </Text>
                      </Column>
                    );
                  })}
                </Row>
              </Section>
            )}

            {/* Order Reference Box */}
            <Section style={metaBoxStyle}>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>ORDER REFERENCE</Text>
                  <Text style={metaValueStyle}>#{orderNumber}</Text>
                </Column>
                <Column style={{ width: "50%", textAlign: "right" }}>
                  <Text style={metaLabelStyle}>LIFECYCLE STATUS</Text>
                  <Text
                    style={{
                      ...metaValueStyle,
                      color: currentStatusInfo.accentColor,
                    }}
                  >
                    {status.toUpperCase()}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Piece Summary */}
            {items && items.length > 0 && (
              <>
                <Text style={sectionTitleStyle}>COMMISSIONED PIECES IN THIS SHIPMENT</Text>
                <Section style={cardStyle}>
                  {items.map((item, index) => {
                    const title = item.productTitle || item.productName || "Heirloom Solid Timber Piece";
                    const timber = item.timberTitle || item.timberOption || "Nilambur Grade-A Teak";

                    return (
                      <div key={index} style={itemRowStyle(index === items.length - 1)}>
                        <Row>
                          <Column style={{ width: "70%" }}>
                            <Text style={itemTitleStyle}>{title}</Text>
                            <Text style={itemTimberStyle}>Finish: {timber}</Text>
                            <Text style={itemQtyStyle}>Quantity: {item.quantity}</Text>
                          </Column>
                          {item.lineTotal && (
                            <Column style={{ width: "30%", textAlign: "right", verticalAlign: "top" }}>
                              <Text style={itemPriceStyle}>₹{item.lineTotal.toLocaleString("en-IN")}</Text>
                            </Column>
                          )}
                        </Row>
                      </div>
                    );
                  })}
                </Section>
              </>
            )}

            {/* Destination Address if available */}
            {address && (
              <Section style={cardStyle}>
                <Text style={metaLabelStyle}>DESTINATION ADDRESS</Text>
                <Text style={addressTextStyle}>{address}</Text>
              </Section>
            )}

            {/* Action CTA */}
            <Section style={ctaSectionStyle}>
              <Link href={orderUrl} style={buttonStyle}>
                Track Piece Live &rarr;
              </Link>
            </Section>

            <Text style={craftsmanshipNoticeStyle}>
              Questions regarding white-glove arrival scheduling or custom leveling? Connect directly with our Bangalore concierge.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>
              TEAK HAUS ATELIER • Flagship Studios: 100ft Road Indiranagar &amp; VR Whitefield, Bengaluru.
            </Text>
            <Text style={footerSubTextStyle}>
              Direct Concierge: +91 98860 00000 • concierge@teakhaus.in
            </Text>
            <Text style={footerLegalStyle}>
              &copy; {new Date().getFullYear()} TEAK HAUS Furniture LLP. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------- STYLES ----------------
const mainStyle: React.CSSProperties = {
  backgroundColor: "#121110",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: "0 auto",
  padding: "32px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#171615",
  border: "1px solid #2A2724",
  borderRadius: "8px",
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden",
};

const headerSectionStyle: React.CSSProperties = {
  backgroundColor: "#131211",
  borderBottom: "1px solid #2A2724",
  padding: "32px 24px",
  textAlign: "center",
};

const brandHeadingStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "24px",
  fontWeight: "normal",
  letterSpacing: "0.15em",
  color: "#FAF9F6",
  margin: "0",
};

const brandSubtitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  letterSpacing: "0.2em",
  color: "#D4A373",
  margin: "8px 0 0 0",
  textTransform: "uppercase",
};

const contentSectionStyle: React.CSSProperties = {
  padding: "32px 28px",
};

const badgeWrapperStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "16px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "5px 12px",
  backgroundColor: "#22201D",
  border: "1px solid #3E3A35",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const greetingHeadingStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "22px",
  color: "#FAF9F6",
  textAlign: "center",
  margin: "0 0 16px 0",
  fontWeight: "normal",
};

const introTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#FAF9F6",
  margin: "0 0 8px 0",
  fontWeight: "bold",
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#9B9287",
  margin: "0 0 24px 0",
};

const pipelineSectionStyle: React.CSSProperties = {
  backgroundColor: "#1B1A18",
  border: "1px solid #2A2724",
  borderRadius: "6px",
  padding: "16px 12px",
  marginBottom: "24px",
};

const metaBoxStyle: React.CSSProperties = {
  backgroundColor: "#1B1A18",
  border: "1px solid #2A2724",
  borderRadius: "6px",
  padding: "12px 16px",
  marginBottom: "20px",
};

const metaLabelStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  color: "#706860",
  letterSpacing: "0.1em",
  margin: "0 0 4px 0",
  textTransform: "uppercase",
};

const metaValueStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#FAF9F6",
  margin: "0",
  fontWeight: "bold",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.15em",
  color: "#706860",
  textTransform: "uppercase",
  margin: "20px 0 8px 0",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#1B1A18",
  border: "1px solid #2A2724",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "16px",
};

const itemRowStyle = (isLast: boolean): React.CSSProperties => ({
  paddingBottom: isLast ? "0" : "12px",
  marginBottom: isLast ? "0" : "12px",
  borderBottom: isLast ? "none" : "1px solid #262421",
});

const itemTitleStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#FAF9F6",
  margin: "0 0 2px 0",
};

const itemTimberStyle: React.CSSProperties = {
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#9B9287",
  margin: "0 0 2px 0",
};

const itemQtyStyle: React.CSSProperties = {
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#706860",
  margin: "0",
};

const itemPriceStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#D4A373",
  fontWeight: "bold",
  margin: "0",
};

const addressTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#FAF9F6",
  lineHeight: "1.5",
  margin: "4px 0 0 0",
};

const ctaSectionStyle: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0 20px 0",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#D4A373",
  color: "#121110",
  fontSize: "11px",
  fontFamily: "monospace",
  fontWeight: "bold",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "4px",
};

const craftsmanshipNoticeStyle: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: "1.5",
  color: "#706860",
  textAlign: "center",
  margin: "16px 0 0 0",
};

const footerSectionStyle: React.CSSProperties = {
  backgroundColor: "#131211",
  borderTop: "1px solid #2A2724",
  padding: "24px 20px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: "monospace",
  color: "#706860",
  margin: "0 0 4px 0",
};

const footerSubTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: "monospace",
  color: "#9B9287",
  margin: "0 0 8px 0",
};

const footerLegalStyle: React.CSSProperties = {
  fontSize: "9px",
  fontFamily: "monospace",
  color: "#524C46",
  margin: "0",
};

export default OrderStatusUpdateEmail;
