import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

export interface PasswordResetProps {
  username?: string;
  resetUrl: string;
}

export default function PasswordReset({
  username = 'there',
  resetUrl,
}: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={heading}>Deepcrawl</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Reset your password</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              We received a request to reset your password for your DeepCrawl
              account. Click the button below to create a new password.
            </Text>

            <Section style={buttonContainer}>
              <Button href={resetUrl} style={button}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              If you didn't request a password reset, you can safely ignore this
              email. Your password will remain unchanged.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This link will expire in 1 hour for security reasons.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (reusing from email verification for consistency)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  padding: '32px 20px',
  backgroundColor: '#000000',
};

const heading = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  paddingTop: '32px',
  paddingBottom: '32px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '27px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

// Preview props for development server
PasswordReset.PreviewProps = {
  username: 'Jane Smith',
  resetUrl: 'https://auth.deepcrawl.dev/reset-password?token=xyz789abc123',
} as PasswordResetProps;
