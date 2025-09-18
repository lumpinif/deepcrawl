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
import { EMAIL_CONFIG } from '../configs/constants';
import { secondsToMinutes } from '../utils/time-converter';
import {
  button,
  buttonContainer,
  container,
  content,
  footer,
  h1,
  heading,
  hr,
  logoContainer,
  main,
  text,
} from './styles';

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
              Deepcrawl is a easy and mordern solution for web scraping and data
              extraction. Join your team to start collaborating on projects and
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

            <Text style={footer}>
              This invitation will expire in{' '}
              {secondsToMinutes(EMAIL_CONFIG.EXpiresIn.invitation) / 60 / 24}{' '}
              days.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for development server
OrganizationInvitation.PreviewProps = {
  invitedEmail: 'newmember@example.com',
  inviterName: 'Sarah Johnson',
  inviterEmail: 'sarah@deepcrawl.dev',
  organizationName: 'Deepcrawl Team',
  invitationUrl: 'https://auth.deepcrawl.dev/accept-invitation/inv_123456789',
} as OrganizationInvitationProps;
