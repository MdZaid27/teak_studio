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

export interface OrderConfirmationEmailProps {
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
}

export function OrderConfirmationEmail({
  orderNumber = "ORD-2026-8891",
  customerName = "Maharaja Vikramaditya",
  items = [
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
  total = 275000,
  address = "14 Lavelle Road, Richmond Town, Bengaluru, Karnataka - 560001",
  paymentMethod = "Inspection Upon Delivery / Zero Upfront",
  orderUrl = "https://teakhaus.in/account",
}: OrderConfirmationEmailProps) {
  const formattedTotal = (total || 0).toLocaleString("en-IN");

  return (
    <Html lang="en">
      <Head />
      <Preview>Acquisition Confirmed: Order #{orderNumber} — TEAK HAUS</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Atelier Brand Header */}
          <Section style={headerSectionStyle}>
            <Heading style={brandHeadingStyle}>TEAK HAUS</Heading>
            <Text style={brandSubtitleStyle}>
              SOLID HARDWOOD &amp; HEIRLOOM JOINERY • BENGALURU
            </Text>
          </Section>

          {/* Hero Confirmation Banner */}
          <Section style={contentSectionStyle}>
            <div style={badgeWrapperStyle}>
              <span style={badgeStyle}>ACQUISITION CONFIRMED</span>
            </div>

            <Heading as="h2" style={greetingHeadingStyle}>
              Thank You, {customerName}
            </Heading>
            <Text style={introTextStyle}>
              Your acquisition has been registered with our Bengaluru atelier.
              Master joiners will oversee the selection of kiln-dried, seasoned
              heartwood timber for your commissioned piece.
            </Text>

            {/* Order Meta Bar */}
            <Section style={metaBoxStyle}>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>ORDER REFERENCE</Text>
                  <Text style={metaValueStyle}>#{orderNumber}</Text>
                </Column>
                <Column style={{ width: "50%", textAlign: "right" }}>
                  <Text style={metaLabelStyle}>PAYMENT METHOD</Text>
                  <Text style={metaValueStyle}>{paymentMethod}</Text>
                </Column>
              </Row>
            </Section>

            {/* Itemized Piece List */}
            <Text style={sectionTitleStyle}>COMMISSIONED PIECES</Text>
            <Section style={cardStyle}>
              {items.map((item, index) => {
                const title = item.productTitle || item.productName || "Heirloom Solid Timber Piece";
                const timber = item.timberTitle || item.timberOption || "Nilambur Grade-A Teak";
                const amount = (item.lineTotal || (item.unitPrice || 0) * item.quantity).toLocaleString("en-IN");

                return (
                  <div key={index} style={itemRowStyle(index === items.length - 1)}>
                    <Row>
                      <Column style={{ width: "65%" }}>
                        <Text style={itemTitleStyle}>{title}</Text>
                        <Text style={itemTimberStyle}>Timber: {timber}</Text>
                        <Text style={itemQtyStyle}>Quantity: {item.quantity}</Text>
                      </Column>
                      <Column style={{ width: "35%", textAlign: "right", verticalAlign: "top" }}>
                        <Text style={itemPriceStyle}>₹{amount}</Text>
                      </Column>
                    </Row>
                  </div>
                );
              })}

              <Hr style={hrStyle} />

              <Row style={{ marginTop: "12px" }}>
                <Column style={{ width: "60%" }}>
                  <Text style={summaryLabelStyle}>White-Glove Delivery &amp; Leveling</Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={complimentaryStyle}>COMPLIMENTARY</Text>
                </Column>
              </Row>

              <Row style={{ marginTop: "8px" }}>
                <Column style={{ width: "60%" }}>
                  <Text style={totalLabelStyle}>Total Acquisition</Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={totalPriceStyle}>₹{formattedTotal}</Text>
                </Column>
              </Row>
            </Section>

            {/* Destination Address Card */}
            <Text style={sectionTitleStyle}>WHITE-GLOVE DESTINATION</Text>
            <Section style={cardStyle}>
              <Text style={addressTextStyle}>{address}</Text>
              <Text style={logisticsNoticeStyle}>
                Full white-glove two-person room-of-choice placement and protective felt leveling included.
              </Text>
            </Section>

            {/* Action CTA */}
            <Section style={ctaSectionStyle}>
              <Link href={orderUrl} style={buttonStyle}>
                View Order Status &rarr;
              </Link>
            </Section>

            <Text style={craftsmanshipNoticeStyle}>
              All TEAK HAUS pieces are constructed exclusively with traditional mortise-and-tenon
              timber joinery and natural plant-based oil finishes.
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

// ---------------- STYLES (#FAF9F6 LUXURY PALETTE) ----------------
const mainStyle: React.CSSProperties = {
  backgroundColor: "#FAF9F6",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: "0 auto",
  padding: "40px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #EAE4DC",
  borderRadius: "8px",
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(44, 26, 17, 0.04)",
};

const headerSectionStyle: React.CSSProperties = {
  backgroundColor: "#2C1A11",
  borderBottom: "1px solid #3D261A",
  padding: "36px 24px",
  textAlign: "center",
};

const brandHeadingStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Cormorant Garamond', serif",
  fontSize: "24px",
  fontWeight: "normal",
  letterSpacing: "0.2em",
  color: "#FAF9F6",
  margin: "0",
};

const brandSubtitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  letterSpacing: "0.22em",
  color: "#D4A373",
  margin: "8px 0 0 0",
  textTransform: "uppercase",
};

const contentSectionStyle: React.CSSProperties = {
  padding: "36px 32px",
  backgroundColor: "#FFFFFF",
};

const badgeWrapperStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "16px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 14px",
  backgroundColor: "#F7F2EB",
  border: "1px solid #E4D8C8",
  borderRadius: "4px",
  color: "#895029",
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: "bold",
};

const greetingHeadingStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Cormorant Garamond', serif",
  fontSize: "24px",
  color: "#2C1A11",
  textAlign: "center",
  margin: "0 0 8px 0",
  fontWeight: "normal",
};

const introTextStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#5C5248",
  textAlign: "center",
  margin: "0 0 24px 0",
};

const metaBoxStyle: React.CSSProperties = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #EAE4DC",
  borderRadius: "6px",
  padding: "14px 18px",
  marginBottom: "24px",
};

const metaLabelStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  color: "#8C7E74",
  letterSpacing: "0.12em",
  margin: "0 0 4px 0",
  textTransform: "uppercase",
};

const metaValueStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#2C1A11",
  margin: "0",
  fontWeight: "bold",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.15em",
  color: "#8C7E74",
  textTransform: "uppercase",
  margin: "24px 0 8px 0",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #EAE4DC",
  borderRadius: "6px",
  padding: "18px",
  marginBottom: "20px",
};

const itemRowStyle = (isLast: boolean): React.CSSProperties => ({
  paddingBottom: isLast ? "0" : "14px",
  marginBottom: isLast ? "0" : "14px",
  borderBottom: isLast ? "none" : "1px solid #EAE4DC",
});

const itemTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#2C1A11",
  margin: "0 0 4px 0",
};

const itemTimberStyle: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: "monospace",
  color: "#6B5E55",
  margin: "0 0 2px 0",
};

const itemQtyStyle: React.CSSProperties = {
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#8C7E74",
  margin: "0",
};

const itemPriceStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "14px",
  color: "#895029",
  fontWeight: "bold",
  margin: "0",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#EAE4DC",
  margin: "14px 0",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B5E55",
  margin: "0",
};

const complimentaryStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  color: "#15803D",
  letterSpacing: "0.1em",
  margin: "0",
  fontWeight: "bold",
};

const totalLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#2C1A11",
  margin: "0",
};

const totalPriceStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "17px",
  color: "#895029",
  fontWeight: "bold",
  margin: "0",
};

const addressTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#2C1A11",
  lineHeight: "1.5",
  margin: "0 0 8px 0",
};

const logisticsNoticeStyle: React.CSSProperties = {
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#7A6C62",
  margin: "0",
};

const ctaSectionStyle: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0 20px 0",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#2C1A11",
  color: "#FAF9F6",
  fontSize: "11px",
  fontFamily: "monospace",
  fontWeight: "bold",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "14px 32px",
  borderRadius: "4px",
};

const craftsmanshipNoticeStyle: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: "1.5",
  color: "#8C7E74",
  textAlign: "center",
  margin: "16px 0 0 0",
  fontStyle: "italic",
};

const footerSectionStyle: React.CSSProperties = {
  backgroundColor: "#F4EFEA",
  borderTop: "1px solid #EAE4DC",
  padding: "28px 24px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: "monospace",
  color: "#7A6C62",
  margin: "0 0 4px 0",
};

const footerSubTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: "monospace",
  color: "#8C7E74",
  margin: "0 0 8px 0",
};

const footerLegalStyle: React.CSSProperties = {
  fontSize: "9px",
  fontFamily: "monospace",
  color: "#A0948A",
  margin: "0",
};

export default OrderConfirmationEmail;
