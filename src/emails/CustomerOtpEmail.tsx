import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Preview,
} from "@react-email/components";

export interface CustomerOtpEmailProps {
  otpCode: string;
  patronName?: string;
  phone?: string;
  expiryMinutes?: number;
}

export function CustomerOtpEmail({
  otpCode = "123456",
  patronName,
  phone,
  expiryMinutes = 10,
}: CustomerOtpEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your TEAK HAUS Patron Atelier Access Pass: {otpCode}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Heading style={brandHeadingStyle}>TEAK HAUS</Heading>
            <Text style={brandSubtitleStyle}>
              PATRON ATELIER &bull; SECURE ACCESS PASS
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSectionStyle}>
            <div style={badgeWrapperStyle}>
              <span style={badgeStyle}>ONE-TIME ACCESS PASS</span>
            </div>

            <Heading as="h2" style={greetingHeadingStyle}>
              {patronName ? `Welcome back, ${patronName}` : "Your Verification Code"}
            </Heading>

            <Text style={introTextStyle}>
              Use the single-use authorization code below to verify your patron identity and sign in to your atelier account.
            </Text>

            {/* OTP Display Card */}
            <Section style={codeCardStyle}>
              <Text style={codeMetaLabelStyle}>AUTHENTICATION CODE</Text>
              <div style={otpCodeBoxStyle}>
                <span style={otpCodeTextStyle}>{otpCode}</span>
              </div>
              <Text style={expiryTextStyle}>
                Valid for {expiryMinutes} minutes &bull; Single-use only
              </Text>
            </Section>

            {phone && (
              <Text style={associatedPhoneStyle}>
                Requested for mobile: <strong>{phone}</strong>
              </Text>
            )}

            {/* Security Notice */}
            <Section style={securityCardStyle}>
              <Text style={securityNoticeHeadingStyle}>SECURITY ADVISORY</Text>
              <Text style={securityNoticeTextStyle}>
                TEAK HAUS concierges will never contact you to request this verification pass. Do not share this code with anyone. If you did not initiate this request, you can safely ignore this email.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSectionStyle}>
            <Text style={footerBrandStyle}>TEAK HAUS ATELIER</Text>
            <Text style={footerAddressStyle}>
              Indiranagar &bull; Whitefield &bull; Bengaluru, Karnataka, India
            </Text>
            <Text style={footerDisclaimerStyle}>
              Artisanal Teak Joinery &bull; Direct From Heritage Forest Reserves
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------

const mainStyle: React.CSSProperties = {
  backgroundColor: "#F7F5F0",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "40px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5DFD7",
  borderRadius: "8px",
  maxWidth: "540px",
  margin: "0 auto",
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
};

const headerSectionStyle: React.CSSProperties = {
  backgroundColor: "#1A1412",
  padding: "32px 24px",
  textAlign: "center",
  borderBottom: "2px solid #895029",
};

const brandHeadingStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Cormorant Garamond', serif",
  fontSize: "26px",
  letterSpacing: "0.22em",
  color: "#F5EFEB",
  margin: "0 0 6px 0",
  fontWeight: "normal",
};

const brandSubtitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "9px",
  letterSpacing: "0.25em",
  color: "#C2A68C",
  margin: "0",
  textTransform: "uppercase",
};

const contentSectionStyle: React.CSSProperties = {
  padding: "36px 32px 28px 32px",
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
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  fontWeight: "bold",
  backgroundColor: "#F7F2EB",
  borderColor: "#E4D8C8",
  color: "#895029",
  border: "1px solid #E4D8C8",
};

const greetingHeadingStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Cormorant Garamond', serif",
  fontSize: "24px",
  color: "#1A1412",
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

const codeCardStyle: React.CSSProperties = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #EAE4DC",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center",
  marginBottom: "20px",
};

const codeMetaLabelStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.18em",
  color: "#8C7E74",
  textTransform: "uppercase",
  margin: "0 0 12px 0",
};

const otpCodeBoxStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #D8C7B8",
  borderRadius: "6px",
  padding: "16px 20px",
  display: "inline-block",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
};

const otpCodeTextStyle: React.CSSProperties = {
  fontFamily: "'SF Mono', Monaco, Menlo, Consolas, monospace",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "0.35em",
  color: "#895029",
  margin: "0",
};

const expiryTextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#8C7E74",
  margin: "14px 0 0 0",
};

const associatedPhoneStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B5E55",
  textAlign: "center",
  margin: "0 0 20px 0",
};

const securityCardStyle: React.CSSProperties = {
  backgroundColor: "#FFFDF9",
  border: "1px dashed #D6C7BA",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "8px",
};

const securityNoticeHeadingStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.12em",
  color: "#895029",
  fontWeight: "bold",
  margin: "0 0 6px 0",
};

const securityNoticeTextStyle: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: "1.6",
  color: "#6E6258",
  margin: "0",
};

const footerSectionStyle: React.CSSProperties = {
  backgroundColor: "#FAF7F2",
  padding: "24px 32px",
  textAlign: "center",
  borderTop: "1px solid #EAE4DC",
};

const footerBrandStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Cormorant Garamond', serif",
  fontSize: "13px",
  letterSpacing: "0.15em",
  color: "#2C1A11",
  fontWeight: "bold",
  margin: "0 0 4px 0",
};

const footerAddressStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#8C7E74",
  margin: "0 0 4px 0",
};

const footerDisclaimerStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "#A89B90",
  margin: "0",
  fontStyle: "italic",
};
