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

  const badgeColor = isCancelled ? "#EF4444" : isConfirmed ? "#10B981" : "#D4A373";

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
                  borderColor: badgeColor,
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
              registered on our studio schedule.
            </Text>

            {/* Appointment Card */}
            <Section style={cardStyle}>
              <Row style={{ marginBottom: "12px" }}>
                <Column>
                  <Text style={metaLabelStyle}>ATELIER LOCATION</Text>
                  <Text style={locationTitleStyle}>{studioLocation}</Text>
                  <Text style={locationAddressStyle}>{atelierInfo.address}</Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: "12px" }}>
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
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #282522" }}>
                  <Text style={metaLabelStyle}>PATRON SPECIFICATIONS / NOTES</Text>
                  <Text style={notesTextStyle}>{notes}</Text>
                </div>
              )}
            </Section>

            {/* What to Expect Section */}
            <Text style={sectionTitleStyle}>WHAT TO EXPECT DURING YOUR VISIT</Text>
            <Section style={cardStyle}>
              <Text style={guidelineItemStyle}>
                • <strong>Tactile Timber Library:</strong> Inspect cross-sections of 40+ year-old seasoned Nilambur, Hunsur, and Burma teak.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Live Joinery Inspection:</strong> Experience full-scale mortise-and-tenon and butterfly key demonstration pieces.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Architect Consultation:</strong> Discuss custom spatial dimensions and grain orientation with our senior woodsmiths.
              </Text>
            </Section>

            {/* Practical Arrival Details */}
            <Section style={metaBoxStyle}>
              <Text style={metaLabelStyle}>ARRIVAL &amp; CONCIERGE ACCESS</Text>
              <Text style={metaBodyStyle}>
                Complimentary reserved patron parking is available at the atelier entry. Upon arrival,
                state your name ({patronName}) or reservation ref #{bookingId.slice(0, 8)} to our concierge.
              </Text>
            </Section>

            {/* Action CTA */}
            <Section style={ctaSectionStyle}>
              <Link href={atelierInfo.mapUrl} style={buttonStyle}>
                Open Studio Map Directions &rarr;
              </Link>
            </Section>

            <Text style={craftsmanshipNoticeStyle}>
              Need to reschedule? Call our atelier studio desk directly at {atelierInfo.phone} or reply to this dispatch.
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
  margin: "0 0 8px 0",
  fontWeight: "normal",
};

const introTextStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#9B9287",
  textAlign: "center",
  margin: "0 0 24px 0",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#1B1A18",
  border: "1px solid #2A2724",
  borderRadius: "6px",
  padding: "18px",
  marginBottom: "16px",
};

const metaLabelStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  color: "#706860",
  letterSpacing: "0.1em",
  margin: "0 0 4px 0",
  textTransform: "uppercase",
};

const locationTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#FAF9F6",
  margin: "0 0 2px 0",
};

const locationAddressStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#9B9287",
  margin: "0",
  lineHeight: "1.4",
};

const scheduleValueStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "13px",
  color: "#D4A373",
  fontWeight: "bold",
  margin: "0",
};

const sessionValueStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#FAF9F6",
  margin: "0",
};

const notesTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#FAF9F6",
  margin: "0",
  lineHeight: "1.4",
  fontStyle: "italic",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.15em",
  color: "#706860",
  textTransform: "uppercase",
  margin: "20px 0 8px 0",
};

const guidelineItemStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#9B9287",
  lineHeight: "1.6",
  margin: "0 0 8px 0",
};

const metaBoxStyle: React.CSSProperties = {
  backgroundColor: "#1B1A18",
  border: "1px solid #2A2724",
  borderRadius: "6px",
  padding: "14px 16px",
  marginBottom: "20px",
};

const metaBodyStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#9B9287",
  lineHeight: "1.5",
  margin: "0",
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

export default StudioBookingEmail;
