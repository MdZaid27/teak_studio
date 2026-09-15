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
  Preview,
} from "@react-email/components";

export interface StudioBookingEmailProps {
  bookingId: string;
  patronName: string;
  patronEmail?: string;
  patronPhone?: string;
  studioLocation: string;
  preferredDate: string;
  preferredTimeSlot: string;
  sessionType?: string;
  notes?: string | null;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
}

const LOCATION_DETAILS: Record<
  string,
  { address: string; mapUrl: string; hours: string; phone: string }
> = {
  indiranagar: {
    address: "No. 402, 100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    mapUrl: "https://maps.google.com/?q=Indiranagar+Bengaluru",
    hours: "Tue — Sun: 11:00 AM — 8:00 PM",
    phone: "+91 98860 11223",
  },
  whitefield: {
    address: "Atelier Suite 14, VR Bengaluru, Whitefield Main Road, Bengaluru - 560048",
    mapUrl: "https://maps.google.com/?q=Whitefield+Bengaluru",
    hours: "Tue — Sun: 11:00 AM — 8:00 PM",
    phone: "+91 98860 44556",
  },
};

export function StudioBookingEmail({
  bookingId = "BK-2026-9041",
  patronName = "Ayesha Rao",
  studioLocation = "Indiranagar Atelier, Bengaluru",
  preferredDate = "Saturday, 26 September 2026",
  preferredTimeSlot = "11:30 AM",
  sessionType = "Private Gallery Walkthrough & Timber Selection",
  notes = "Looking for bespoke solid teak dining table and ten-seater credenza.",
  status = "confirmed",
}: StudioBookingEmailProps) {
  const isWhitefield = studioLocation.toLowerCase().includes("whitefield");
  const atelierInfo = isWhitefield ? LOCATION_DETAILS.whitefield : LOCATION_DETAILS.indiranagar;

  const isConfirmed = status === "confirmed";
  const isCancelled = status === "cancelled";

  const badgeText = isCancelled
    ? "APPOINTMENT CANCELLED"
    : isConfirmed
    ? "APPOINTMENT CONFIRMED"
    : "APPOINTMENT REQUESTED";

  const badgeColor = isCancelled ? "#B91C1C" : isConfirmed ? "#15803D" : "#895029";
  const badgeBg = isCancelled ? "#FEF2F2" : isConfirmed ? "#F0FDF4" : "#F7F2EB";
  const badgeBorder = isCancelled ? "#FECACA" : isConfirmed ? "#BBF7D0" : "#E4D8C8";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {isConfirmed ? "Confirmed: " : ""}Studio Walkthrough at {studioLocation} — TEAK HAUS
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Heading style={brandHeadingStyle}>TEAK HAUS</Heading>
            <Text style={brandSubtitleStyle}>
              ATELIER EXPERIENCE &amp; BESPOKE CONSULTATION • BENGALURU
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSectionStyle}>
            <div style={badgeWrapperStyle}>
              <span
                style={{
                  ...badgeStyle,
                  borderColor: badgeBorder,
                  backgroundColor: badgeBg,
                  color: badgeColor,
                }}
              >
                {badgeText}
              </span>
            </div>

            <Heading as="h2" style={greetingHeadingStyle}>
              Private Walkthrough Scheduled
            </Heading>
            <Text style={introTextStyle}>
              Honored to welcome you, <strong>{patronName}</strong>. Your appointment has been
              registered on our studio calendar.
            </Text>

            {/* Appointment Card */}
            <Section style={cardStyle}>
              <Row style={{ marginBottom: "14px" }}>
                <Column>
                  <Text style={metaLabelStyle}>ATELIER LOCATION</Text>
                  <Text style={locationTitleStyle}>{studioLocation}</Text>
                  <Text style={locationAddressStyle}>{atelierInfo.address}</Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: "14px" }}>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>SCHEDULED DATE</Text>
                  <Text style={scheduleValueStyle}>{preferredDate}</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>TIME WINDOW</Text>
                  <Text style={scheduleValueStyle}>{preferredTimeSlot}</Text>
                </Column>
              </Row>

              {sessionType && (
                <Row style={{ marginBottom: "8px" }}>
                  <Column>
                    <Text style={metaLabelStyle}>SESSION PURPOSE</Text>
                    <Text style={sessionValueStyle}>{sessionType}</Text>
                  </Column>
                </Row>
              )}

              {notes && (
                <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #EAE4DC" }}>
                  <Text style={metaLabelStyle}>PATRON SPECIFICATIONS / NOTES</Text>
                  <Text style={notesTextStyle}>{notes}</Text>
                </div>
              )}
            </Section>

            {/* What to Expect Section */}
            <Text style={sectionTitleStyle}>WHAT TO EXPECT DURING YOUR VISIT</Text>
            <Section style={cardStyle}>
              <Text style={guidelineItemStyle}>
                • <strong>Tactile Timber Library:</strong> Inspect seasoned cross-sections of 40+ year-old Nilambur, Hunsur, and Burma teak.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Live Joinery Inspection:</strong> Experience full-scale traditional mortise-and-tenon and butterfly key demonstration pieces.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Curator Consultation:</strong> Discuss custom spatial dimensions and grain orientation with our atelier woodsmiths.
              </Text>
            </Section>

            {/* Practical Arrival Details */}
            <Section style={metaBoxStyle}>
              <Text style={metaLabelStyle}>ARRIVAL &amp; CONCIERGE ACCESS</Text>
              <Text style={metaBodyStyle}>
                Complimentary reserved patron parking is available at the atelier entry. Upon arrival,
                state your name ({patronName}) or reservation ref #{bookingId.slice(0, 8)} to our studio desk.
              </Text>
            </Section>

            {/* Action CTA */}
            <Section style={ctaSectionStyle}>
              <Link href={atelierInfo.mapUrl} style={buttonStyle}>
                Open Studio Map Directions &rarr;
              </Link>
            </Section>

            <Text style={craftsmanshipNoticeStyle}>
              Need to reschedule? Call our studio desk directly at {atelierInfo.phone} or reply directly to this email.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>
              TEAK HAUS ATELIER • 100ft Road Indiranagar &amp; VR Whitefield, Bengaluru.
            </Text>
            <Text style={footerSubTextStyle}>
              Curator Desk: {atelierInfo.phone} • studio@teakhaus.in
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
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: "bold",
  border: "1px solid transparent",
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

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #EAE4DC",
  borderRadius: "6px",
  padding: "20px",
  marginBottom: "20px",
};

const metaLabelStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  color: "#8C7E74",
  letterSpacing: "0.12em",
  margin: "0 0 4px 0",
  textTransform: "uppercase",
};

const locationTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#2C1A11",
  margin: "0 0 4px 0",
};

const locationAddressStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B5E55",
  lineHeight: "1.5",
  margin: "0",
};

const scheduleValueStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#895029",
  fontFamily: "monospace",
  margin: "0",
};

const sessionValueStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#2C1A11",
  margin: "0",
};

const notesTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#5C5248",
  lineHeight: "1.5",
  margin: "4px 0 0 0",
  fontStyle: "italic",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.15em",
  color: "#8C7E74",
  textTransform: "uppercase",
  margin: "24px 0 8px 0",
};

const guidelineItemStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#5C5248",
  margin: "0 0 10px 0",
};

const metaBoxStyle: React.CSSProperties = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #EAE4DC",
  borderRadius: "6px",
  padding: "16px 18px",
  marginBottom: "24px",
};

const metaBodyStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#6B5E55",
  margin: "4px 0 0 0",
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

export default StudioBookingEmail;
