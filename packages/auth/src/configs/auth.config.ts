import { getDrizzleDB, schema } from '@deepcrawl/db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  apiKey,
  bearer,
  multiSession,
  oAuthProxy,
  // twoFactor,
  oneTap,
  openAPI,
  organization,
  // customSession
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { defaultOptions } from './default-options';

interface Env {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  DATABASE_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

/** Important: make sure always import this explicitly in workers to resolve process.env issues
 *  Factory function that accepts environment variables from cloudflare env
 */
export function createAuthConfig(env: Env) {
  const db = getDrizzleDB({ DATABASE_URL: env.DATABASE_URL });

  const config = {
    ...defaultOptions,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      // async sendResetPassword({ user, url }) {
      // 	await resend.emails.send({
      // 		from,
      // 		to: user.email,
      // 		subject: "Reset your password",
      // 		react: reactResetPasswordEmail({
      // 			username: user.email,
      // 			resetLink: url,
      // 		}),
      // 	});
      // },
    },
    appName: 'DeepCrawl',
    /**
     * Base path for Better Auth.
     * Must match the path in the app.on for auth handlers
     * @default "/api/auth"
     */
    basePath: '/api/auth',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema: schema }),
    plugins: [
      admin(),
      apiKey(),
      oneTap(),
      bearer(),
      passkey(),
      openAPI(),
      oAuthProxy(),
      multiSession(),
      organization({
        // async sendInvitationEmail(data) {
        // await resend.emails.send({
        // 	from,
        // 	to: data.email,
        // 	subject: "You've been invited to join an organization",
        // 	react: reactInvitationEmail({
        // 		username: data.email,
        // 		invitedByUsername: data.inviter.user.name,
        // 		invitedByEmail: data.inviter.user.email,
        // 		teamName: data.organization.name,
        // 		inviteLink:
        // 			process.env.NODE_ENV === "development"
        // 				? `http://localhost:3000/accept-invitation/${data.id}`
        // 				: `${
        // 						process.env.BETTER_AUTH_URL ||
        // 						"https://demo.better-auth.com"
        // 					}/accept-invitation/${data.id}`,
        // 	}),
        // });
        // },
      }),
      // twoFactor({
      // 	otpOptions: {
      // 		async sendOTP({ user, otp }) {
      // 			await resend.emails.send({
      // 				from,
      // 				to: user.email,
      // 				subject: "Your OTP",
      // 				html: `Your OTP is ${otp}`,
      // 			});
      // 		},
      // 	},
      // }),
      // socialProviders: {
      //   github: {
      //     clientId: env.GITHUB_CLIENT_ID,
      //     clientSecret: env.GITHUB_CLIENT_SECRET,
      //   },
      //   google: {
      //     clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      //     clientSecret: env.GOOGLE_CLIENT_SECRET,
      //   },
      // },
      nextCookies(), // make sure this is the last plugin in the array
    ],
    account: {
      accountLinking: {
        trustedProviders: ['google', 'github'],
      },
    },
    trustedOrigins: [
      // Development origins
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8787',
      'http://127.0.0.1:8787',
      // Production origins (add your actual domains)
      'https://auth.deepcrawl.dev',
      'https://deepcrawl.dev',
      'https://app.deepcrawl.dev',
    ],
  };

  return config;
}
