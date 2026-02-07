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

export interface EmailVerificationProps {
  username?: string;
  verificationUrl: string;
  brandName?: string;
}

export default function EmailVerification({
  username = 'there',
  verificationUrl,
  brandName = 'Deepcrawl',
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={heading}>{brandName}</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Verify your email address</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              Welcome to {brandName}! Please verify your email address by
              clicking the button below.
            </Text>

            <Section style={buttonContainer}>
              <Button href={verificationUrl} style={button}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={text}>
              If you didn't create an account with {brandName}, you can safely
              ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This link will expire in{' '}
              {secondsToMinutes(EMAIL_CONFIG.EXpiresIn.emailVerification)}{' '}
              minutes for security reasons.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for development server
EmailVerification.PreviewProps = {
  username: 'John Doe',
  verificationUrl: 'https://auth.deepcrawl.dev/verify?token=abc123def456',
  brandName: 'Deepcrawl',
} as EmailVerificationProps;
