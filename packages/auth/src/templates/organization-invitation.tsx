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

export interface OrganizationInvitationProps {
  invitedEmail: string;
  inviterName?: string;
  inviterEmail?: string;
  organizationName: string;
  invitationUrl: string;
}

export default function OrganizationInvitation({
  invitedEmail,
  inviterName = 'Someone',
  inviterEmail,
  organizationName,
  invitationUrl,
}: OrganizationInvitationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={heading}>Deepcrawl</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              You're invited to join {organizationName}
            </Heading>

            <Text style={text}>Hi there,</Text>

            <Text style={text}>
              {inviterName} ({inviterEmail}) has invited you to join{' '}
              <strong>{organizationName}</strong> on Deepcrawl.
            </Text>

            <Text style={text}>
              Deepcrawl is a powerful platform for web crawling and SEO
              analysis. Join your team to start collaborating on projects and
              insights.
            </Text>

            <Section style={buttonContainer}>
              <Button href={invitationUrl} style={button}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={text}>
              If you don't want to join this organization, you can safely ignore
              this email.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>This invitation will expire in 7 days.</Text>
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
OrganizationInvitation.PreviewProps = {
  invitedEmail: 'newmember@example.com',
  inviterName: 'Sarah Johnson',
  inviterEmail: 'sarah@deepcrawl.dev',
  organizationName: 'Deepcrawl Team',
  invitationUrl: 'https://auth.deepcrawl.dev/accept-invitation/inv_123456789',
} as OrganizationInvitationProps;
