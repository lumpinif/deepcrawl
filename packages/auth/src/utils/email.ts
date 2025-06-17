import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

// Initialize Resend client
export function createResendClient(apiKey: string) {
  return new Resend(apiKey);
}

// Email sending utility
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: ReactElement;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(resend: Resend, options: SendEmailOptions) {
  const {
    to,
    subject,
    template,
    from = 'DeepCrawl <noreply@deepcrawl.dev>',
    replyTo,
  } = options;

  try {
    const html = await render(template);
    const text = await render(template, { plainText: true });

    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    console.log('📧 Email sent successfully:', {
      to,
      subject,
      id: result.data?.id,
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
