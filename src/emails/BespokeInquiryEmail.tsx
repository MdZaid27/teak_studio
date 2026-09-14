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
              Our workshop design architects have received your architectural specifications for reference ref #{inquiryId.slice(0, 8)}.
            </Text>

            {/* Inquiry Specifications Card */}
            <Section style={cardStyle}>
              <Row style={{ marginBottom: "12px" }}>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>TYPOLOGY</Text>
                  <Text style={metaValueStyle}>{projectType}</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={metaLabelStyle}>TIMBER CHOICE</Text>
                  <Text style={{ ...metaValueStyle, color: "#D4A373" }}>{timberPreference}</Text>
                </Column>
              </Row>

              {approxDimensions && (
                <Row style={{ marginBottom: "12px" }}>
                  <Column>
                    <Text style={metaLabelStyle}>DIMENSIONS &amp; SPATIAL SCALE</Text>
                    <Text style={specTextStyle}>{approxDimensions}</Text>
                  </Column>
                </Row>
              )}

              {budgetRange && (
                <Row style={{ marginBottom: "12px" }}>
                  <Column>
                    <Text style={metaLabelStyle}>ANTICIPATED INVESTMENT RANGE</Text>
                    <Text style={{ ...metaValueStyle, color: "#D4A373" }}>{budgetRange}</Text>
                  </Column>
                </Row>
              )}

              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #282522" }}>
                <Text style={metaLabelStyle}>CRAFTSMANSHIP SPECIFICATIONS</Text>
                <Text style={messageTextStyle}>{message}</Text>
              </div>
            </Section>

            {/* Next Steps Card */}
            <Text style={sectionTitleStyle}>WHAT HAPPENS NEXT</Text>
            <Section style={cardStyle}>
              <Text style={guidelineItemStyle}>
                • <strong>Timber Sourcing Assessment:</strong> Our timber master reviews our current seasoning reserves for heartwood matching your scale.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Structural Feasibility:</strong> We inspect grain stress points and calculate internal steel or butterfly key stabilization.
              </Text>
              <Text style={guidelineItemStyle}>
                • <strong>Architect Connect:</strong> A senior bespoke architect will reach out within 24 hours with rough schematics and timber swatches.
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
  color: "#D4A373",
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

const metaValueStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#FAF9F6",
  margin: "0",
};

const specTextStyle: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: "monospace",
  color: "#FAF9F6",
  margin: "0",
};

const messageTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#FAF9F6",
  lineHeight: "1.5",
  margin: "0",
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

const craftsmanshipNoticeStyle: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: "1.5",
  color: "#706860",
  textAlign: "center",
  margin: "20px 0 0 0",
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

export default BespokeInquiryEmail;
