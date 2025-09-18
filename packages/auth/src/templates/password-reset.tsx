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
              We received a request to reset your password for your Deepcrawl
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
              This link will expire in{' '}
              {secondsToMinutes(EMAIL_CONFIG.EXpiresIn.resetPassword)} minutes
              for security reasons.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for development server
PasswordReset.PreviewProps = {
  username: 'Jane Smith',
  resetUrl: 'https://auth.deepcrawl.dev/reset-password?token=xyz789abc123',
} as PasswordResetProps;
