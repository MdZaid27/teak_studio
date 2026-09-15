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
  Preview,
} from "@react-email/components";

export interface BespokeInquiryEmailProps {
  inquiryId: string;
  patronName: string;
  patronEmail?: string;
  patronPhone?: string;
  projectType: string;
  timberPreference: string;
  approxDimensions?: string | null;
  budgetRange?: string | null;
  message: string;
}

export function BespokeInquiryEmail({
  inquiryId = "INQ-2026-0042",
  patronName = "Vikramaditya Singhania",
  projectType = "Executive Boardroom Dining Suite",
  timberPreference = "Salvaged 50-Year Riverbed Teak",
  approxDimensions = "14ft x 5ft monolithic live-edge slab",
  budgetRange = "₹5,00,000 — ₹10,00,000",
  message = "Commissioning a signature boardroom table for heritage family office headquarters.",
}: BespokeInquiryEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Commission Brief Acknowledged: {projectType} — TEAK HAUS
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Heading style={brandHeadingStyle}>TEAK HAUS</Heading>
            <Text style={brandSubtitleStyle}>
              BESPOKE COMMISSIONS &amp; ARCHITECTURAL JOINERY • BENGALURU
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSectionStyle}>
            <div style={badgeWrapperStyle}>
              <span style={badgeStyle}>ARCHITECTURAL COMMISSION BRIEF</span>
            </div>

            <Heading as="h2" style={greetingHeadingStyle}>
              Brief Received, {patronName}
            </Heading>
            <Text style={introTextStyle}>
              Our workshop design architects have received your architectural specifications for commission ref #{inquiryId.slice(0, 8)}.
            </Text>

            {/* Inquiry Specifications Card */}
            <Section style={cardStyle}>
              <Row style={{ marginBottom: "14px" }}>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>TYPOLOGY</Text>
                  <Text style={metaValueStyle}>{projectType}</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>TIMBER CHOICE</Text>
                  <Text style={{ ...metaValueStyle, color: "#895029" }}>{timberPreference}</Text>
                </Column>
              </Row>

              {approxDimensions && (
                <Row style={{ marginBottom: "14px" }}>
                  <Column>
                    <Text style={metaLabelStyle}>DIMENSIONS &amp; SPATIAL SCALE</Text>
                    <Text style={specTextStyle}>{approxDimensions}</Text>
                  </Column>
                </Row>
              )}

              {budgetRange && (
                <Row style={{ marginBottom: "14px" }}>
                  <Column>
                    <Text style={metaLabelStyle}>ANTICIPATED INVESTMENT RANGE</Text>
                    <Text style={{ ...metaValueStyle, color: "#895029" }}>{budgetRange}</Text>
                  </Column>
                </Row>
              )}

              <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #EAE4DC" }}>
                <Text style={metaLabelStyle}>CRAFTSMANSHIP SPECIFICATIONS</Text>
                <Text style={messageTextStyle}>{message}</Text>
              </div>
            </Section>

            {/* Next Steps Card */}
            <Text style={sectionTitleStyle}>WHAT HAPPENS NEXT</Text>
            <Section style={cardStyle}>
              <Text style={guidelineItemStyle}>
                • <strong>Timber Sourcing Assessment:</strong> Our timber master reviews our seasoning reserves for heartwood matching your scale.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Structural Feasibility:</strong> We inspect grain stress points and calculate internal timber butterfly key stabilization.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Architect Connect:</strong> A senior bespoke architect will reach out within 24 hours with conceptual sketches and timber recommendations.
              </Text>
            </Section>

            <Text style={craftsmanshipNoticeStyle}>
              Direct architectural inquiry line: +91 98860 11223 • bespoke@teakhaus.in
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>
              TEAK HAUS ATELIER • Flagship Studios: 100ft Road Indiranagar &amp; VR Whitefield, Bengaluru.
            </Text>
            <Text style={footerSubTextStyle}>
              Bespoke Department: +91 98860 11223 • concierge@teakhaus.in
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

const metaValueStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "13px",
  color: "#2C1A11",
  margin: "0",
  fontWeight: "bold",
};

const specTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#2C1A11",
  margin: "0",
};

const messageTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#5C5248",
  lineHeight: "1.6",
  margin: "4px 0 0 0",
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

export default BespokeInquiryEmail;
