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

export interface MagicLinkProps {
  username?: string;
  magicLinkUrl: string;
}

export default function MagicLink({
  username = 'there',
  magicLinkUrl,
}: MagicLinkProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={heading}>DeepCrawl</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Sign in to your account</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              You requested a magic link to sign in to your DeepCrawl account.
              Click the button below to continue.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={magicLinkUrl}>
                Sign In to DeepCrawl
              </Button>
            </Section>

            <Text style={text}>
              If you didn't request this link, you can safely ignore this email.
              Your account remains secure.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This link will expire in 5 minutes for security reasons.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (consistent with other templates)
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
MagicLink.PreviewProps = {
  username: 'John Doe',
  magicLinkUrl:
    'https://auth.deepcrawl.dev/api/auth/magic-link/verify?token=abc123def456&callbackURL=https%3A%2F%2Fapp.deepcrawl.dev%2Fdashboard',
} as MagicLinkProps;
