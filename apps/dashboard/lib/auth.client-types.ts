import type { authClient } from './auth.client';

// Infer types from the client auth instance
export type ClientSession = typeof authClient.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
