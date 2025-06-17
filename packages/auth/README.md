# @deepcrawl/auth

Authentication package for DeepCrawl using Better Auth with email functionality powered by Resend and React Email.

## Features

- ✅ **Multi-session support** - Users can be logged into multiple accounts simultaneously
- ✅ **Email verification** - Beautiful HTML emails for email verification
- ✅ **Password reset** - Secure password reset flow with styled emails  
- ✅ **Organization invitations** - Team invitation emails
- ✅ **Cross-domain cookies** - Works across deepcrawl.dev subdomains
- ✅ **Social auth** - GitHub and Google OAuth
- ✅ **Passkeys** - WebAuthn passwordless authentication

## Installation

```bash
pnpm add @deepcrawl/auth
```

## Environment Variables

Add these environment variables to your Cloudflare Worker:

```env
# Required
AUTH_WORKER_NODE_ENV=development  # or 'production'
BETTER_AUTH_URL=http://localhost:8787  # Your auth worker URL
BETTER_AUTH_SECRET=your_secret_key
DATABASE_URL=your_postgres_url

# OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (optional - emails will be logged if not provided)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL="DeepCrawl <noreply@deepcrawl.dev>"
```

## Basic Usage

### Setting up the auth worker

```typescript
import { createAuthConfig } from '@deepcrawl/auth';

// In your Cloudflare Worker
export default {
  async fetch(request: Request, env: Env) {
    const auth = createAuthConfig(env);
    
    // Handle auth routes
    if (request.url.includes('/api/auth')) {
      return auth.handler(request);
    }
    
    return new Response('Not found', { status: 404 });
  },
};
```

### Using email templates

```typescript
import { 
  createResendClient, 
  sendEmail, 
  EmailVerification,
  PasswordReset,
  OrganizationInvitation 
} from '@deepcrawl/auth';

const resend = createResendClient(env.RESEND_API_KEY);

// Send verification email
await sendEmail(resend, {
  to: 'user@example.com',
  subject: 'Verify your email',
  template: EmailVerification({
    username: 'John Doe',
    verificationUrl: 'https://app.deepcrawl.dev/verify?token=abc123',
  }),
});

// Send password reset email
await sendEmail(resend, {
  to: 'user@example.com',
  subject: 'Reset your password',
  template: PasswordReset({
    username: 'John Doe',
    resetUrl: 'https://app.deepcrawl.dev/reset?token=abc123',
  }),
});
```

## Email Templates

### EmailVerification

Used for email verification during signup.

**Props:**
- `username` (optional): User's display name
- `verificationUrl`: URL to verify the email

### PasswordReset

Used for password reset requests.

**Props:**
- `username` (optional): User's display name  
- `resetUrl`: URL to reset the password

### OrganizationInvitation

Used for organization/team invitations.

**Props:**
- `invitedEmail`: Email being invited
- `inviterName` (optional): Name of person sending invite
- `inviterEmail` (optional): Email of person sending invite
- `organizationName`: Name of the organization
- `invitationUrl`: URL to accept the invitation

## Development vs Production

### Development
- Emails are logged to console if `RESEND_API_KEY` is not provided
- Cross-domain cookies are disabled
- Uses localhost origins

### Production  
- Emails are sent via Resend (requires `RESEND_API_KEY`)
- Cross-domain cookies enabled for `.deepcrawl.dev`
- Secure, partitioned cookies for cross-site compatibility

## Multi-Session Configuration

The package is configured for a maximum of 2 concurrent sessions per user. Users can:

1. Login with their primary account
2. Add a secondary account via "Add Account" flow
3. Switch between accounts seamlessly
4. Remove accounts as needed

## Architecture

```
packages/auth/
├── src/
│   ├── configs/
│   │   └── auth.config.ts       # Better Auth configuration
│   ├── utils/
│   │   └── email.ts             # Resend utilities
│   ├── templates/
│   │   ├── email-verification.tsx
│   │   ├── password-reset.tsx
│   │   ├── organization-invitation.tsx
│   │   └── index.ts
│   └── index.ts                 # Main exports
├── package.json
└── README.md
```

## Troubleshooting

### Emails not sending

1. Check that `RESEND_API_KEY` is properly set
2. Verify the `FROM_EMAIL` domain is verified in Resend
3. Check worker logs for error messages

### Multi-session issues

1. Verify cookies are being set correctly in browser DevTools
2. Check that `maximumSessions: 2` in the config
3. Ensure cross-domain configuration matches your environment

### Cookie issues in production

1. Verify domains match exactly (`.deepcrawl.dev`)
2. Check that `secure: true` and `sameSite: 'none'` are set
3. Consider removing `partitioned: true` if having cross-site issues 