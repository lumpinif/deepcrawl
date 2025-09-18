import type * as React from 'react';
import { Resend } from 'resend';

// Initialize Resend client
export function createResendClient(apiKey: string) {
  return new Resend(apiKey);
}

// Email sending utility
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: React.ReactNode;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(resend: Resend, options: SendEmailOptions) {
  const {
    to,
    subject,
    template,
    from = 'Deepcrawl <noreply@deepcrawl.dev>',
    replyTo,
  } = options;

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      react: template,
      replyTo,
    });

    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

// Validation utility
export function validateEmailConfig(apiKey?: string, fromEmail?: string) {
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not provided - emails will be logged only');
    return false;
  }

  if (!fromEmail) {
    console.warn('⚠️ FROM_EMAIL not provided - using default from address');
  }

  return true;
}
