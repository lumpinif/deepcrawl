import type { auth } from '@deepcrawl/auth/lib/auth';

// Infer types from the server auth instance
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
