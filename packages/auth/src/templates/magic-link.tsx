import { EMAIL_CONFIG } from '@deepcrawl/auth/configs/constants';
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
            <Heading style={heading}>Deepcrawl</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Sign in to your account</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              You requested a magic link to sign in to your Deepcrawl account.
              Click the button below to continue.
            </Text>

            <Section style={buttonContainer}>
              <Button href={magicLinkUrl} style={button}>
                Sign In to Deepcrawl
              </Button>
            </Section>

            <Text style={text}>
              If you didn't request this link, you can safely ignore this email.
              Your account remains secure.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This link will expire in{' '}
              {secondsToMinutes(EMAIL_CONFIG.EXpiresIn.magicLink)} minutes for
              security reasons.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for development server
MagicLink.PreviewProps = {
  username: 'John Doe',
  magicLinkUrl:
    'https://auth.deepcrawl.dev/api/auth/magic-link/verify?token=abc123def456&callbackURL=https%3A%2F%2Fdeepcrawl.dev%2Fapp',
} as MagicLinkProps;
